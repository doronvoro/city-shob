import { Component } from '@angular/core';
import { TaskListComponent } from '../../components/task-list/task-list.component';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [TaskListComponent],
  providers: [TaskService],
  template: `<app-task-list />`
})
export class DashboardPageComponent {}
