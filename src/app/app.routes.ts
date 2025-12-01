import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./modules/auth/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'tasks',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/task/task-list/task-list.component')
          .then(m => m.TaskListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./modules/task/task-form/task-form.component')
          .then(m => m.TaskFormComponent)
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./modules/task/task-form/task-form.component')
          .then(m => m.TaskFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./modules/task/task-detail/task-detail.component')
          .then(m => m.TaskDetailComponent)
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
