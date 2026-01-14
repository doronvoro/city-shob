import { TaskPriority } from '../../../core/constants';

/**
 * Task status filter options
 */
export type TaskStatusFilter = 'all' | 'active' | 'completed';

/**
 * Priority filter options
 */
export type PriorityFilter = TaskPriority | 'all';

/**
 * Task filter interface - defines all filter criteria
 */
export interface TaskFilter {
  searchQuery: string;
  priority: PriorityFilter;
  status: TaskStatusFilter;
}

/**
 * Default filter values
 */
export const DEFAULT_TASK_FILTER: TaskFilter = {
  searchQuery: '',
  priority: 'all',
  status: 'all',
};
