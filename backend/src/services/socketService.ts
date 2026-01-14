import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import TaskRepository from '../repositories/TaskRepository';
import { TaskData, SocketTaskData, SocketDeleteData, SocketLockData, ClientInfo, JwtPayload } from '../types';
import { SOCKET_ROOMS, SOCKET_ROOM_PREFIXES, ERROR_MESSAGES } from '../constants';

/**
 * Extended socket type with custom data
 */
type AuthenticatedSocket = Socket & {
  data: {
    userId?: string;
    email?: string;
    clientId?: string;
    isAuthenticated?: boolean;
  };
};

/**
 * Socket Service - Manages WebSocket connections and real-time updates
 * Uses Singleton pattern to ensure single instance
 */
class SocketService {
  private io: SocketIOServer | null = null;
  private connectedClients: Map<string, ClientInfo> = new Map();

  /**
   * Initialize the socket service with Socket.IO instance
   * @param io - Socket.IO instance
   */
  initialize(io: SocketIOServer): void {
    this.io = io;
    this.setupAuthMiddleware();
    this.setupEventHandlers();
  }

  /**
   * Setup Socket.IO authentication middleware
   * Validates JWT token from handshake auth
   */
  private setupAuthMiddleware(): void {
    if (!this.io) return;

    this.io.use((socket: AuthenticatedSocket, next) => {
      const token = socket.handshake.auth.token;
      const clientId = socket.handshake.auth.clientId;

      // Store clientId even without auth
      socket.data.clientId = clientId;

      if (!token) {
        // Allow connection without token, but mark as unauthenticated
        socket.data.isAuthenticated = false;
        return next();
      }

      try {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
          console.error('JWT_SECRET not configured');
          socket.data.isAuthenticated = false;
          return next();
        }

        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
        socket.data.userId = decoded.userId;
        socket.data.email = decoded.email;
        socket.data.isAuthenticated = true;
        next();
      } catch (err) {
        // Invalid token - allow connection but mark as unauthenticated
        console.warn(`Socket auth failed: ${(err as Error).message}`);
        socket.data.isAuthenticated = false;
        next();
      }
    });
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      const clientId = socket.data.clientId || socket.id;
      console.log(`Client connected: ${socket.id} (clientId: ${clientId}, authenticated: ${socket.data.isAuthenticated})`);

      // Store client info
      this.connectedClients.set(socket.id, {
        socketId: socket.id,
        clientId,
        userId: socket.data.userId,
        connectedAt: new Date()
      });

      // Join appropriate rooms
      socket.join(SOCKET_ROOMS.TASKS);
      if (socket.data.isAuthenticated) {
        socket.join(SOCKET_ROOMS.AUTHENTICATED);
        // Join user-specific room for targeted messages
        socket.join(`${SOCKET_ROOM_PREFIXES.USER}${socket.data.userId}`);
      }

      // Handle task creation (requires authentication for createdBy tracking)
      socket.on('task:create', async (taskData: TaskData) => {
        try {
          // Add createdBy if authenticated
          const taskWithCreator: TaskData = {
            ...taskData,
            ...(socket.data.isAuthenticated && socket.data.userId && { createdBy: socket.data.userId })
          };

          const task = await TaskRepository.create(taskWithCreator);

          // Broadcast to tasks room
          this.io!.to(SOCKET_ROOMS.TASKS).emit('task:created', task);
        } catch (error) {
          const err = error as Error;
          socket.emit('error', { message: ERROR_MESSAGES.FAILED_TO_CREATE_TASK, error: err.message });
        }
      });

      socket.on('task:update', async (data: SocketTaskData) => {
        try {
          const { id, updateData } = data;
          const effectiveClientId = data.clientId || clientId;

          // Use atomic update with lock check
          const updatedTask = await TaskRepository.update(id, updateData, effectiveClientId);

          if (!updatedTask) {
            // Task not found or locked by another client
            const lockStatus = await TaskRepository.checkLockStatus(id, effectiveClientId);
            if (lockStatus.locked) {
              socket.emit('error', {
                message: ERROR_MESSAGES.TASK_EDITED_BY_OTHER,
                taskId: id,
                lockedBy: lockStatus.lockedBy
              });
            } else {
              socket.emit('error', { message: ERROR_MESSAGES.TASK_NOT_FOUND, taskId: id });
            }
            return;
          }

          // Broadcast to tasks room
          this.io!.to(SOCKET_ROOMS.TASKS).emit('task:updated', updatedTask);
        } catch (error) {
          const err = error as Error;
          socket.emit('error', { message: ERROR_MESSAGES.FAILED_TO_UPDATE_TASK, error: err.message });
        }
      });

      socket.on('task:delete', async (data: SocketDeleteData) => {
        try {
          const { id } = data;
          const effectiveClientId = data.clientId || clientId;

          // Use atomic delete with lock check
          const deletedTask = await TaskRepository.delete(id, effectiveClientId);

          if (!deletedTask) {
            const lockStatus = await TaskRepository.checkLockStatus(id, effectiveClientId);
            if (lockStatus.locked) {
              socket.emit('error', {
                message: ERROR_MESSAGES.TASK_DELETE_LOCKED,
                taskId: id,
                lockedBy: lockStatus.lockedBy
              });
            } else {
              socket.emit('error', { message: ERROR_MESSAGES.TASK_NOT_FOUND, taskId: id });
            }
            return;
          }

          // Broadcast to tasks room
          this.io!.to(SOCKET_ROOMS.TASKS).emit('task:deleted', { id });
        } catch (error) {
          const err = error as Error;
          socket.emit('error', { message: ERROR_MESSAGES.FAILED_TO_DELETE_TASK, error: err.message });
        }
      });

      socket.on('task:lock', async (data: SocketLockData) => {
        try {
          const { id } = data;
          const effectiveClientId = data.clientId || clientId;

          // Atomic lock acquisition
          const task = await TaskRepository.acquireLock(id, effectiveClientId);

          if (!task) {
            const lockStatus = await TaskRepository.checkLockStatus(id, effectiveClientId);
            socket.emit('task:lock-failed', {
              id,
              message: ERROR_MESSAGES.TASK_ALREADY_EDITED,
              editedBy: lockStatus.lockedBy
            });
            return;
          }

          // Notify all clients in tasks room about the lock
          this.io!.to(SOCKET_ROOMS.TASKS).emit('task:locked', { id, editedBy: effectiveClientId });
        } catch (error) {
          const err = error as Error;
          socket.emit('error', { message: ERROR_MESSAGES.FAILED_TO_LOCK_TASK, error: err.message });
        }
      });

      socket.on('task:unlock', async (data: SocketLockData) => {
        try {
          const { id } = data;
          const effectiveClientId = data.clientId || clientId;

          await TaskRepository.releaseLock(id, effectiveClientId);

          // Notify all clients in tasks room about the unlock
          this.io!.to(SOCKET_ROOMS.TASKS).emit('task:unlocked', { id });
        } catch (error) {
          const err = error as Error;
          socket.emit('error', { message: ERROR_MESSAGES.FAILED_TO_UNLOCK_TASK, error: err.message });
        }
      });

      // Handle disconnection - clean up orphaned locks
      socket.on('disconnect', async () => {
        console.log(`Client disconnected: ${socket.id} (clientId: ${clientId})`);

        // Release all locks held by this client
        try {
          const releasedCount = await TaskRepository.releaseAllLocksByClient(clientId);
          if (releasedCount > 0) {
            console.log(`Released ${releasedCount} orphaned lock(s) for client: ${clientId}`);
            // Notify other clients about the released locks
            this.io!.to(SOCKET_ROOMS.TASKS).emit('locks:released', { clientId, count: releasedCount });
          }
        } catch (error) {
          console.error(`Failed to release locks for client ${clientId}:`, (error as Error).message);
        }

        this.connectedClients.delete(socket.id);
      });
    });
  }

  /**
   * Broadcast a task update to all connected clients in the tasks room
   * @param event - Event name
   * @param data - Data to broadcast
   */
  broadcast(event: string, data: unknown): void {
    if (this.io) {
      this.io.to(SOCKET_ROOMS.TASKS).emit(event, data);
    }
  }

  /**
   * Send a message to a specific user (all their connected sockets)
   * @param userId - User ID
   * @param event - Event name
   * @param data - Data to send
   */
  sendToUser(userId: string, event: string, data: unknown): void {
    if (this.io) {
      this.io.to(`${SOCKET_ROOM_PREFIXES.USER}${userId}`).emit(event, data);
    }
  }

  /**
   * Get count of connected clients
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
}

// Singleton Pattern - Export a single instance
export default new SocketService();

