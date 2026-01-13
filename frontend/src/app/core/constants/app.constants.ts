/**
 * Storage keys for localStorage
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  CURRENT_USER: 'current_user',
  CLIENT_ID: 'clientId',
} as const;

/**
 * Socket.IO event names
 */
export const SOCKET_EVENTS = {
  // Incoming events (from server)
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_DELETED: 'task:deleted',
  TASK_LOCKED: 'task:locked',
  TASK_UNLOCKED: 'task:unlocked',
  TASK_LOCK_FAILED: 'task:lock-failed',
  ERROR: 'error',
  // Outgoing events (to server)
  CREATE: 'task:create',
  UPDATE: 'task:update',
  DELETE: 'task:delete',
  LOCK: 'task:lock',
  UNLOCK: 'task:unlock',
} as const;

/**
 * Task priority enum
 */
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

/**
 * Priority to Material color mapping
 */
export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  [TaskPriority.HIGH]: 'warn',
  [TaskPriority.MEDIUM]: 'accent',
  [TaskPriority.LOW]: 'primary',
};

/**
 * Snackbar duration options in milliseconds
 */
export const SNACKBAR_DURATION = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 5000,
} as const;

/**
 * Dialog configuration
 */
export const DIALOG_CONFIG = {
  TASK_DIALOG_WIDTH: '440px',
  TASK_DIALOG_PANEL_CLASS: 'task-sheet-panel',
  TASK_DIALOG_BACKDROP_CLASS: 'task-sheet-backdrop',
  CONFIRM_DIALOG_WIDTH: '420px',
  CONFIRM_DIALOG_PANEL_CLASS: 'confirm-dialog-panel',
  CONFIRM_DIALOG_BACKDROP_CLASS: 'dialog-backdrop',
} as const;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGIN: '/api/auth/login',
  TASKS: '/api/tasks',
} as const;
