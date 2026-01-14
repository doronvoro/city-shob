import { TaskPriority, TaskStatus, FILTER_VALUES } from '../../../core/constants';

/**
 * Task status filter options
 */
export type TaskStatusFilter = TaskStatus;

/**
 * Priority filter options
 */
export type PriorityFilter = TaskPriority | typeof FILTER_VALUES.ALL;

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
  priority: FILTER_VALUES.ALL,
  status: TaskStatus.ALL,
};
