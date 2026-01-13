import { Injectable, inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../../environments/environment';
import { STORAGE_KEYS, SOCKET_EVENTS, API_ENDPOINTS } from '../../../core/constants';
import { Task } from '../models/task.model';

/**
 * Task Service - manages task CRUD via Socket.IO and HTTP
 * Provided at component level for lazy-loaded feature
 */
@Injectable()
export class TaskService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private socket!: Socket;
  private readonly tasksSubject = new BehaviorSubject<Task[]>([]);
  public readonly tasks$ = this.tasksSubject.asObservable();
  private readonly clientId: string;

  constructor() {
    this.clientId = this.generateClientId();
    this.initializeSocket();
  }

  /**
   * Generate unique client ID for browser instance
   */
  private generateClientId = (): string => {
    let clientId = localStorage.getItem(STORAGE_KEYS.CLIENT_ID);
    if (!clientId) {
      clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(STORAGE_KEYS.CLIENT_ID, clientId);
    }
    return clientId;
  };

  /**
   * Initialize WebSocket connection
   */
  private initializeSocket = (): void => {
    this.socket = io(this.apiUrl);

    this.socket.on(SOCKET_EVENTS.TASK_CREATED, (task: Task) => {
      this.addTaskToLocalState(task);
    });

    this.socket.on(SOCKET_EVENTS.TASK_UPDATED, (task: Task) => {
      this.updateTaskInLocalState(task);
    });

    this.socket.on(SOCKET_EVENTS.TASK_DELETED, (data: { id: string }) => {
      this.removeTaskFromLocalState(data.id);
    });

    this.socket.on(SOCKET_EVENTS.TASK_LOCKED, (data: { id: string; editedBy: string }) => {
      this.updateTaskLockState(data.id, data.editedBy);
    });

    this.socket.on(SOCKET_EVENTS.TASK_UNLOCKED, (data: { id: string }) => {
      this.updateTaskLockState(data.id, null);
    });

    this.socket.on(SOCKET_EVENTS.ERROR, (error: unknown) => {
      console.error('Socket error:', error);
    });

    this.socket.on(SOCKET_EVENTS.TASK_LOCK_FAILED, (data: unknown) => {
      console.warn('Task lock failed:', data);
    });
  };

  /**
   * Get all tasks from server
   */
  getTasks = (): Observable<Task[]> => {
    this.http.get<{ data: Task[]; pagination: unknown }>(`${this.apiUrl}${API_ENDPOINTS.TASKS}`).subscribe({
      next: response => this.tasksSubject.next(response.data || []),
      error: error => console.error('Error fetching tasks:', error)
    });
    return this.tasks$;
  };

  /**
   * Create a new task via Socket
   */
  createTask = (task: Partial<Task>): void => {
    this.socket.emit(SOCKET_EVENTS.CREATE, task);
  };

  /**
   * Update a task via Socket
   */
  updateTask = (id: string, task: Partial<Task>): void => {
    this.socket.emit(SOCKET_EVENTS.UPDATE, {
      id,
      updateData: task,
      clientId: this.clientId
    });
  };

  /**
   * Delete a task via Socket
   */
  deleteTask = (id: string): void => {
    this.socket.emit(SOCKET_EVENTS.DELETE, { id, clientId: this.clientId });
  };

  /**
   * Lock a task for editing
   */
  lockTask = (id: string): void => {
    this.socket.emit(SOCKET_EVENTS.LOCK, { id, clientId: this.clientId });
  };

  /**
   * Unlock a task
   */
  unlockTask = (id: string): void => {
    this.socket.emit(SOCKET_EVENTS.UNLOCK, { id, clientId: this.clientId });
  };

  /**
   * Check if current client can edit a task
   */
  canEditTask = (task: Task): boolean => !task.editedBy || task.editedBy === this.clientId;

  /**
   * Get current client ID
   */
  getClientId = (): string => this.clientId;

  /**
   * Add task to local state (immutable)
   */
  private addTaskToLocalState = (task: Task): void => {
    const currentTasks = this.tasksSubject.value;
    const exists = currentTasks.some(t => t._id === task._id);
    if (!exists) {
      this.tasksSubject.next([task, ...currentTasks]);
    }
  };

  /**
   * Update task in local state (immutable)
   */
  private updateTaskInLocalState = (updatedTask: Task): void => {
    const currentTasks = this.tasksSubject.value;
    this.tasksSubject.next(
      currentTasks.map(t => t._id === updatedTask._id ? updatedTask : t)
    );
  };

  /**
   * Remove task from local state (immutable)
   */
  private removeTaskFromLocalState = (taskId: string): void => {
    const currentTasks = this.tasksSubject.value;
    this.tasksSubject.next(currentTasks.filter(t => t._id !== taskId));
  };

  /**
   * Update task lock state (immutable)
   */
  private updateTaskLockState = (taskId: string, editedBy: string | null): void => {
    const currentTasks = this.tasksSubject.value;
    this.tasksSubject.next(
      currentTasks.map(t =>
        t._id === taskId
          ? { ...t, editedBy, editedAt: editedBy ? new Date() : null }
          : t
      )
    );
  };

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
