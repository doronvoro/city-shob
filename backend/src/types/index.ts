import { Request } from 'express';
import { ITask } from '../models/Task';
import { IUser } from '../models/User';

export type { ITask, IUser };

// Task priority enum for type safety
export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const;

export type TaskPriorityType = typeof TaskPriority[keyof typeof TaskPriority];

export type TaskData = {
  title: string;
  description?: string;
  completed?: boolean;
  priority?: TaskPriorityType;
  dueDate?: Date | null;
  editedBy?: string | null;
  editedAt?: Date | null;
  createdBy?: string;
};

export type UserData = {
  email: string;
  password: string;
};

export type AuthRequest = Request & {
  user?: IUser;
};

export type SocketTaskData = {
  id: string;
  updateData: Partial<TaskData>;
  clientId: string;
};

export type SocketDeleteData = {
  id: string;
  clientId: string;
};

export type SocketLockData = {
  id: string;
  clientId: string;
};

export type ClientInfo = {
  socketId: string;
  clientId?: string;
  userId?: string;
  connectedAt: Date;
};

export type JwtPayload = {
  userId: string;
  email: string;
};

// Pagination types
export type PaginationParams = {
  page?: number;
  limit?: number;
};

export type PaginatedResult<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

// Error types
export type AppError = Error & {
  statusCode?: number;
  isOperational?: boolean;
};

