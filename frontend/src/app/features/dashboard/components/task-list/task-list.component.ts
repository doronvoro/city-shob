import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { FilterService } from '../../services/filter.service';
import { TaskFilter, DEFAULT_TASK_FILTER } from '../../models/filter.model';
import { TaskItemComponent } from '../task-item/task-item.component';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';
import { FilterBarComponent } from '../filter-bar/filter-bar.component';
import { SNACKBAR_DURATION, DIALOG_CONFIG } from '../../../../core/constants';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    TaskItemComponent,
    MatSnackBarModule,
    MatDialogModule,
    FilterBarComponent,
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit, OnDestroy {
  private readonly taskService = inject(TaskService);
  private readonly filterService = inject(FilterService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  private subscription = new Subscription();
  private readonly filter$ = new BehaviorSubject<TaskFilter>({ ...DEFAULT_TASK_FILTER });
  filteredTasks$: Observable<Task[]> = this.filterService.createFilteredStream(
    this.taskService.tasks$,
    this.filter$
  );

  getCompletedCount = (): number => {
    return this.filteredTasks.filter(task => task.completed).length;
  };

  getTotalCount = (): number => {
    return this.filteredTasks.length;
  };

  getActiveTasks = (): Task[] => {
    return this.filteredTasks.filter(task => !task.completed);
  };

  getCompletedTasks = (): Task[] => {
    return this.filteredTasks.filter(task => task.completed);
  };

  hasActiveFilters = (): boolean => {
    return this.filterService.isFilterActive(this.filter$.value);
  };

  ngOnInit(): void {
    // Subscribe to all tasks (for reference)
    const tasksSub = this.taskService.tasks$.subscribe(tasks => {
      this.tasks = tasks;
    });
    this.subscription.add(tasksSub);

    // Subscribe to filtered tasks (for display)
    const filteredSub = this.filteredTasks$.subscribe(filtered => {
      this.filteredTasks = filtered;
    });
    this.subscription.add(filteredSub);

    this.taskService.getTasks();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  openAddTaskDialog = (): void => {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: DIALOG_CONFIG.TASK_DIALOG_WIDTH,
      panelClass: DIALOG_CONFIG.TASK_DIALOG_PANEL_CLASS,
      backdropClass: DIALOG_CONFIG.TASK_DIALOG_BACKDROP_CLASS,
      position: { right: '0' },
      data: { task: null, isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.createTask(result);
        this.snackBar.open('Task created successfully', 'Close', {
          duration: SNACKBAR_DURATION.SHORT
        });
      }
    });
  };

  onTaskUpdated = (_task: Task): void => {
    // Task update is handled by the task-item component
  };

  onTaskDeleted(_taskId: string): void {
    this.snackBar.open('Task deleted successfully', 'Close', {
      duration: SNACKBAR_DURATION.SHORT
    });
  }

  trackByTaskId(_index: number, task: Task): string {
    return task._id || '';
  }

  onFilterChange(filter: TaskFilter): void {
    this.filter$.next(filter);
  }
}
