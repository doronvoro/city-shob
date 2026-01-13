import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TaskDialogComponent } from './task-dialog.component';
import { TaskDialogData } from '../../models/task.model';
import { TaskPriority } from '../../../../core/constants';

describe('TaskDialogComponent', () => {
  let component: TaskDialogComponent;
  let fixture: ComponentFixture<TaskDialogComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<TaskDialogComponent>>;

  const mockDialogData: TaskDialogData = {
    task: null,
    isEdit: false
  };

  beforeEach(async () => {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [TaskDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default priority as medium', () => {
    expect(component.taskForm.get('priority')?.value).toBe(TaskPriority.MEDIUM);
  });

  it('should close dialog on cancel', () => {
    component.onCancel();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('should not save if form is invalid', () => {
    component.onSave();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('should save if form is valid', () => {
    component.taskForm.patchValue({ title: 'Test Task' });
    component.onSave();
    expect(dialogRef.close).toHaveBeenCalled();
  });
});
