import { TaskPriority } from '../../../core/constants';

/**
 * Task type - represents a to-do task
 */
export type Task = {
  _id?: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: TaskPriority;
  dueDate?: Date | string | null;
  editedBy?: string | null;
  editedAt?: Date | string | null;
  createdBy?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

/**
 * Dialog data for task create/edit dialog
 */
export type TaskDialogData = {
  task: Task | null;
  isEdit: boolean;
};
