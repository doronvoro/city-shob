import { Injectable } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Task } from '../models/task.model';
import { TaskFilter, DEFAULT_TASK_FILTER } from '../models/filter.model';
import { TaskPriority, TaskStatus, FILTER_VALUES } from '../../../core/constants';

/**
 * Filter Service - handles task filtering logic using RxJS
 * Provides pure filtering functions and reactive stream composition
 */
@Injectable()
export class FilterService {
  /**
   * Filter tasks based on filter criteria
   * Pure function - no side effects, easy to test
   */
  filterTasks(tasks: Task[], filter: TaskFilter): Task[] {
    if (!tasks || tasks.length === 0) {
      return [];
    }

    let filtered = [...tasks];

    // Apply search filter
    if (filter.searchQuery.trim()) {
      const query = filter.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(task => {
        const titleMatch = task.title?.toLowerCase().includes(query) ?? false;
        const descriptionMatch = task.description?.toLowerCase().includes(query) ?? false;
        return titleMatch || descriptionMatch;
      });
    }

    // Apply priority filter
    if (filter.priority !== FILTER_VALUES.ALL) {
      filtered = filtered.filter(task => task.priority === filter.priority);
    }

    // Apply status filter
    if (filter.status === TaskStatus.ACTIVE) {
      filtered = filtered.filter(task => !task.completed);
    } else if (filter.status === TaskStatus.COMPLETED) {
      filtered = filtered.filter(task => task.completed);
    }

    return filtered;
  }

  /**
   * Create a filtered stream from tasks and filter observables
   * Uses combineLatest to reactively combine both streams
   */
  createFilteredStream(
    tasks$: Observable<Task[]>,
    filter$: Observable<TaskFilter>
  ): Observable<Task[]> {
    return combineLatest([tasks$, filter$]).pipe(
      map(([tasks, filter]) => this.filterTasks(tasks, filter)),
      distinctUntilChanged((prev, curr) => {
        // Only emit if the filtered results actually changed
        if (prev.length !== curr.length) return false;
        
        // Check if tasks have changed (not just positions)
        // Compare both IDs and key properties that affect display
        return prev.every((prevTask, index) => {
          const currTask = curr[index];
          if (!currTask || prevTask._id !== currTask._id) return false;
          
          // Check if task properties that affect display have changed
          return (
            prevTask.completed === currTask.completed &&
            prevTask.priority === currTask.priority &&
            prevTask.title === currTask.title &&
            prevTask.description === currTask.description &&
            prevTask.dueDate === currTask.dueDate
          );
        });
      })
    );
  }

  /**
   * Check if a filter is active (not default)
   */
  isFilterActive(filter: TaskFilter): boolean {
    return (
      filter.searchQuery.trim() !== '' ||
      filter.priority !== FILTER_VALUES.ALL ||
      filter.status !== TaskStatus.ALL
    );
  }

  /**
   * Get default filter
   */
  getDefaultFilter(): TaskFilter {
    return { ...DEFAULT_TASK_FILTER };
  }
}
