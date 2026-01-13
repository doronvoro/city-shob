import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PRIORITY_COLORS, SNACKBAR_DURATION, DIALOG_CONFIG, TaskPriority } from '../../../../core/constants';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss']
})
export class TaskItemComponent implements OnInit, OnDestroy {
  @Input({ required: true }) task!: Task;
  @Output() taskUpdated = new EventEmitter<Task>();
  @Output() taskDeleted = new EventEmitter<string>();

  protected readonly taskService = inject(TaskService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  canEdit = false;
  isEditing = false;
  private subscription = new Subscription();

  ngOnInit(): void {
    this.updateCanEdit();
    const sub = this.taskService.tasks$.subscribe(() => this.updateCanEdit());
    this.subscription.add(sub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private updateCanEdit = (): void => {
    this.canEdit = this.taskService.canEditTask(this.task);
  };

  toggleComplete = (): void => {
    if (!this.canEdit) {
      this.snackBar.open('Task is being edited by another user', 'Close', {
        duration: SNACKBAR_DURATION.MEDIUM
      });
      return;
    }
    this.taskService.updateTask(this.task._id!, { completed: !this.task.completed });
  };

  editTask = (): void => {
    if (!this.canEdit) {
      this.snackBar.open('Task is being edited by another user', 'Close', {
        duration: SNACKBAR_DURATION.MEDIUM
      });
      return;
    }

    this.taskService.lockTask(this.task._id!);
    this.isEditing = true;

    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: DIALOG_CONFIG.TASK_DIALOG_WIDTH,
      panelClass: DIALOG_CONFIG.TASK_DIALOG_PANEL_CLASS,
      backdropClass: DIALOG_CONFIG.TASK_DIALOG_BACKDROP_CLASS,
      position: { right: '0' },
      data: { task: { ...this.task }, isEdit: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.isEditing = false;
      if (result) {
        this.taskService.updateTask(this.task._id!, result);
        this.snackBar.open('Task updated successfully', 'Close', {
          duration: SNACKBAR_DURATION.SHORT
        });
      } else {
        this.taskService.unlockTask(this.task._id!);
      }
    });
  };

  deleteTask = (): void => {
    if (!this.canEdit) {
      this.snackBar.open('Cannot delete task being edited by another user', 'Close', {
        duration: SNACKBAR_DURATION.MEDIUM
      });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: DIALOG_CONFIG.CONFIRM_DIALOG_WIDTH,
      panelClass: DIALOG_CONFIG.CONFIRM_DIALOG_PANEL_CLASS,
      backdropClass: DIALOG_CONFIG.CONFIRM_DIALOG_BACKDROP_CLASS,
      data: {
        title: 'Delete Task',
        message: 'Are you sure you want to delete this task? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.deleteTask(this.task._id!);
        this.taskDeleted.emit(this.task._id);
      }
    });
  };

  getPriorityColor = (priority: TaskPriority): string => {
    return PRIORITY_COLORS[priority] || 'primary';
  };

  formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return '';
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (d.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  isOverdue = (): boolean => {
    if (!this.task.dueDate || this.task.completed) return false;
    return new Date(this.task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));
  };

  isToday = (): boolean => {
    if (!this.task.dueDate) return false;
    return new Date(this.task.dueDate).toDateString() === new Date().toDateString();
  };
}
