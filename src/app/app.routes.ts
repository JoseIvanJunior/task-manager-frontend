// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./modules/auth/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./modules/auth/register/register.component')
      .then(m => m.RegisterComponent)
  },
  {
    path: 'tasks',
    loadComponent: () => import('./modules/task/task-list/task-list.component')
      .then(m => m.TaskListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'tasks/new',
    loadComponent: () => import('./modules/task/task-form/task-form.component')
      .then(m => m.TaskFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'tasks/edit/:id',
    loadComponent: () => import('./modules/task/task-form/task-form.component')
      .then(m => m.TaskFormComponent),
    canActivate: [authGuard]
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
