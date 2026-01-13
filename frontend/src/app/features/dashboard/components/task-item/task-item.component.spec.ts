import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { TaskItemComponent } from './task-item.component';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { TaskPriority } from '../../../../core/constants';

describe('TaskItemComponent', () => {
  let component: TaskItemComponent;
  let fixture: ComponentFixture<TaskItemComponent>;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  const mockTask: Task = {
    _id: '123',
    title: 'Test Task',
    description: 'Test Description',
    completed: false,
    priority: TaskPriority.MEDIUM
  };

  beforeEach(async () => {
    taskServiceSpy = jasmine.createSpyObj('TaskService', [
      'canEditTask',
      'updateTask',
      'deleteTask',
      'lockTask',
      'unlockTask',
      'getClientId'
    ], {
      tasks$: of([mockTask])
    });
    taskServiceSpy.canEditTask.and.returnValue(true);
    taskServiceSpy.getClientId.and.returnValue('client_123');

    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [TaskItemComponent, NoopAnimationsModule],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskItemComponent);
    component = fixture.componentInstance;
    component.task = mockTask;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display task title', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.task-title').textContent).toContain('Test Task');
  });

  it('should toggle complete when canEdit is true', () => {
    component.toggleComplete();
    expect(taskServiceSpy.updateTask).toHaveBeenCalledWith('123', { completed: true });
  });

  it('should emit taskDeleted on delete when confirmed', () => {
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefSpy.afterClosed.and.returnValue(of(true));
    dialogSpy.open.and.returnValue(dialogRefSpy);
    
    component['dialog'] = dialogSpy;
    spyOn(component.taskDeleted, 'emit');
    
    component.deleteTask();
    
    expect(dialogSpy.open).toHaveBeenCalled();
    expect(taskServiceSpy.deleteTask).toHaveBeenCalledWith('123');
    expect(component.taskDeleted.emit).toHaveBeenCalledWith('123');
  });
});
