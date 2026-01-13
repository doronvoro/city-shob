import Task, { ITask } from '../models/Task';
import { TaskData, PaginationParams, PaginatedResult } from '../types';

// Lock timeout in milliseconds (5 minutes)
const LOCK_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * Repository Pattern for Task database operations
 * Encapsulates all database interactions for tasks
 */
class TaskRepository {
  /**
   * Get all tasks with optional pagination
   * @param params - Pagination parameters
   * @returns Promise<PaginatedResult<ITask>> Paginated tasks
   */
  async findAll(params?: PaginationParams): Promise<PaginatedResult<ITask>> {
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Task.find()
        .populate('createdBy')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Task.countDocuments().exec()
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Get a task by ID
   * @param id - Task ID
   * @returns Promise<ITask | null> Task object
   */
  async findById(id: string): Promise<ITask | null> {
    return Task.findById(id).populate('createdBy').exec();
  }

  /**
   * Create a new task
   * @param taskData - Task data
   * @returns Promise<ITask> Created task
   */
  async create(taskData: TaskData): Promise<ITask> {
    const task = new Task(taskData);
    const savedTask = await task.save();
    return savedTask.populate('createdBy');
  }

  /**
   * Update a task with atomic lock check
   * Prevents race conditions by checking lock in the same query
   * @param id - Task ID
   * @param updateData - Data to update
   * @param clientId - Client requesting the update (for lock validation)
   * @returns Promise<ITask | null> Updated task or null if locked by another client
   */
  async update(id: string, updateData: Partial<TaskData>, clientId?: string): Promise<ITask | null> {
    // Build query conditions for atomic update
    const query: Record<string, unknown> = { _id: id };

    // If clientId provided, ensure task is either unlocked or locked by this client
    if (clientId) {
      query.$or = [
        { editedBy: null },
        { editedBy: clientId },
        // Also allow if lock is stale (older than timeout)
        { editedAt: { $lt: new Date(Date.now() - LOCK_TIMEOUT_MS) } }
      ];
    }

    return Task.findOneAndUpdate(query, updateData, { new: true, runValidators: true })
      .populate('createdBy')
      .exec();
  }

  /**
   * Delete a task with atomic lock check
   * @param id - Task ID
   * @param clientId - Client requesting deletion (for lock validation)
   * @returns Promise<ITask | null> Deleted task or null if locked
   */
  async delete(id: string, clientId?: string): Promise<ITask | null> {
    const query: Record<string, unknown> = { _id: id };

    if (clientId) {
      query.$or = [
        { editedBy: null },
        { editedBy: clientId },
        { editedAt: { $lt: new Date(Date.now() - LOCK_TIMEOUT_MS) } }
      ];
    }

    return Task.findOneAndDelete(query).exec() as unknown as Promise<ITask | null>;
  }

  /**
   * Atomically acquire edit lock on a task
   * Uses findOneAndUpdate to prevent race conditions
   * @param id - Task ID
   * @param clientId - Client requesting the lock
   * @returns Promise<ITask | null> Task with lock or null if already locked
   */
  async acquireLock(id: string, clientId: string): Promise<ITask | null> {
    return Task.findOneAndUpdate(
      {
        _id: id,
        $or: [
          { editedBy: null },
          { editedBy: clientId },
          // Allow acquiring stale locks
          { editedAt: { $lt: new Date(Date.now() - LOCK_TIMEOUT_MS) } }
        ]
      },
      {
        editedBy: clientId,
        editedAt: new Date()
      },
      { new: true }
    )
      .populate('createdBy')
      .exec();
  }

  /**
   * Release edit lock on a task
   * @param id - Task ID
   * @param clientId - Optional client ID to verify ownership
   * @returns Promise<ITask | null> Updated task
   */
  async releaseLock(id: string, clientId?: string): Promise<ITask | null> {
    const query: Record<string, unknown> = { _id: id };

    // If clientId provided, only release if this client owns the lock
    if (clientId) {
      query.editedBy = clientId;
    }

    return Task.findOneAndUpdate(
      query,
      { editedBy: null, editedAt: null },
      { new: true }
    )
      .populate('createdBy')
      .exec();
  }

  /**
   * Release all locks held by a specific client
   * Used when client disconnects
   * @param clientId - Client identifier
   * @returns Promise<number> Number of locks released
   */
  async releaseAllLocksByClient(clientId: string): Promise<number> {
    const result = await Task.updateMany(
      { editedBy: clientId },
      { editedBy: null, editedAt: null }
    ).exec();
    return result.modifiedCount;
  }

  /**
   * Check if a task is locked by someone else
   * @param id - Task ID
   * @param clientId - Current client ID
   * @returns Promise<{ locked: boolean; lockedBy?: string }> Lock status
   */
  async checkLockStatus(id: string, clientId: string): Promise<{ locked: boolean; lockedBy?: string }> {
    const task = await Task.findById(id).exec();

    if (!task) {
      return { locked: false };
    }

    // Check if locked by another client and lock is not stale
    if (task.editedBy && task.editedBy !== clientId) {
      const lockAge = task.editedAt ? Date.now() - task.editedAt.getTime() : 0;
      if (lockAge < LOCK_TIMEOUT_MS) {
        return { locked: true, lockedBy: task.editedBy };
      }
    }

    return { locked: false };
  }

  /**
   * Clean up stale locks (older than timeout)
   * Can be run periodically as maintenance
   * @returns Promise<number> Number of stale locks cleared
   */
  async cleanupStaleLocks(): Promise<number> {
    const result = await Task.updateMany(
      { editedAt: { $lt: new Date(Date.now() - LOCK_TIMEOUT_MS) } },
      { editedBy: null, editedAt: null }
    ).exec();
    return result.modifiedCount;
  }
}

// Singleton Pattern - Export a single instance
export default new TaskRepository();

