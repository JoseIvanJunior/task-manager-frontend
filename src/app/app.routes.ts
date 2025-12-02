// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginComponent } from './modules/auth/login/login.component';
import { RegisterComponent } from './modules/auth/register/register.component';
import { TaskListComponent } from './modules/task/task-list/task-list.component';
import { TaskFormComponent } from './modules/task/task-form/task-form.component';
import { TaskDetailComponent } from './modules/task/task-detail/task-detail.component';

export const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent 
  },
  { 
    path: 'register', 
    component: RegisterComponent 
  },
  {
    path: 'tasks',
    children: [
      {
        path: '',
        component: TaskListComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'new',
        component: TaskFormComponent,
        canActivate: [AuthGuard]
      },
      {
        path: ':id',
        component: TaskDetailComponent,
        canActivate: [AuthGuard]
      },
      {
        path: ':id/edit',
        component: TaskFormComponent,
        canActivate: [AuthGuard]
      }
    ]
  },
  { 
    path: '', 
    redirectTo: '/tasks', 
    pathMatch: 'full' 
  },
  { 
    path: '**', 
    redirectTo: '/tasks' 
  }
];