import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TaskPriority } from '../../../../core/constants';
import { TaskDialogData } from '../../models/task.model';

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './task-dialog.component.html',
  styleUrls: ['./task-dialog.component.scss']
})
export class TaskDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  taskForm: FormGroup;
  readonly priorities = Object.values(TaskPriority);

  constructor(
    private readonly dialogRef: MatDialogRef<TaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskDialogData
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(2000)]],
      priority: [TaskPriority.MEDIUM],
      dueDate: [null],
      completed: [false]
    });
  }

  ngOnInit(): void {
    if (this.data.task) {
      this.taskForm.patchValue({
        title: this.data.task.title,
        description: this.data.task.description || '',
        priority: this.data.task.priority || TaskPriority.MEDIUM,
        dueDate: this.data.task.dueDate ? new Date(this.data.task.dueDate) : null,
        completed: this.data.task.completed || false
      });
    }
  }

  clearDueDate = (): void => {
    this.taskForm.patchValue({ dueDate: null });
  };

  onCancel = (): void => {
    this.dialogRef.close();
  };

  onSave = (): void => {
    if (this.taskForm.valid) {
      const formValue = { ...this.taskForm.value };
      if (formValue.dueDate) {
        formValue.dueDate = formValue.dueDate.toISOString();
      }
      this.dialogRef.close(formValue);
    }
  };
}
