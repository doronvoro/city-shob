/**
 * Error messages used throughout the application
 */
export const ERROR_MESSAGES = {
  // Task errors
  TASK_NOT_FOUND: 'Task not found',
  TASK_EDITED_BY_OTHER: 'Task is being edited by another user',
  TASK_DELETE_LOCKED: 'Cannot delete task being edited by another user',
  TASK_ALREADY_EDITED: 'Task is already being edited',
  
  // Socket task errors
  FAILED_TO_CREATE_TASK: 'Failed to create task',
  FAILED_TO_UPDATE_TASK: 'Failed to update task',
  FAILED_TO_DELETE_TASK: 'Failed to delete task',
  FAILED_TO_LOCK_TASK: 'Failed to lock task',
  FAILED_TO_UNLOCK_TASK: 'Failed to unlock task',
  
  // Auth errors
  EMAIL_ALREADY_REGISTERED: 'Email is already registered',
  INVALID_CREDENTIALS: 'Invalid credentials',
  JWT_SECRET_MISSING: 'JWT_SECRET environment variable is not configured',
  
  // General errors
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  ROUTE_NOT_FOUND: (url: string) => `Route ${url} not found`,
} as const;

/**
 * Success messages used throughout the application
 */
export const SUCCESS_MESSAGES = {
  USER_CREATED: 'User created successfully',
  LOGIN_SUCCESSFUL: 'Login successful',
  TASK_DELETED: 'Task deleted successfully',
} as const;

/**
 * Validation messages used in express-validator
 */
export const VALIDATION_MESSAGES = {
  VALIDATION_FAILED: 'Validation failed',
  EMAIL_REQUIRED: 'Email is required',
  INVALID_EMAIL: 'Invalid email format',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_REQUIREMENTS: 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number',
  TITLE_REQUIRED: 'Title is required',
  TITLE_LENGTH: 'Title must be 1-200 characters',
  DESCRIPTION_LENGTH: 'Description must be less than 2000 characters',
  PRIORITY_INVALID: 'Priority must be low, medium, or high',
  DUE_DATE_INVALID: 'Due date must be a valid date',
  COMPLETED_INVALID: 'Completed must be a boolean',
  TASK_ID_INVALID: 'Invalid task ID',
  CLIENT_ID_INVALID: 'Client ID must be a string',
  PAGE_INVALID: 'Page must be a positive integer',
  LIMIT_INVALID: 'Limit must be between 1 and 100',
} as const;

/**
 * Socket.IO room names
 */
export const SOCKET_ROOMS = {
  TASKS: 'tasks', // All clients interested in task updates
  AUTHENTICATED: 'authenticated', // Authenticated users only
} as const;

/**
 * Socket.IO room prefixes
 */
export const SOCKET_ROOM_PREFIXES = {
  USER: 'user:',
} as const;
