// src/app/modules/task/task-list/task-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { Task, TaskFilter, TaskPriority, TaskStatus } from './../../../core/models/task.model';
import { TaskService } from './../../../core/services/task.service';
import { AuthService } from './../../../core/services/auth.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  displayedColumns: string[] = ['title', 'responsible', 'priority', 'status', 'deadline', 'actions'];
  isAdmin = false;
  currentUser = '';
  isLoading = true;
  showFilters = false;

  filter: TaskFilter = {};
  priorities = Object.values(TaskPriority);
  statuses = Object.values(TaskStatus);

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.currentUser = this.authService.getUsername() || '';
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.taskService.getAllTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Erro ao carregar tarefas', 'Fechar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.isLoading = true;
    this.taskService.filterTasks(this.filter).subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.isLoading = false;
        this.showFilters = false;
      },
      error: (error) => {
        this.snackBar.open('Erro ao filtrar tarefas', 'Fechar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  clearFilters(): void {
    this.filter = {};
    this.loadTasks();
  }

  loadUpcomingTasks(): void {
    this.isLoading = true;
    this.taskService.getUpcomingTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Erro ao carregar tarefas próximas', 'Fechar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  loadOverdueTasks(): void {
    this.isLoading = true;
    this.taskService.getOverdueTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Erro ao carregar tarefas atrasadas', 'Fechar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  completeTask(id: number): void {
    this.taskService.completeTask(id).subscribe({
      next: () => {
        this.snackBar.open('Tarefa concluída com sucesso!', 'Fechar', { duration: 3000 });
        this.loadTasks();
      },
      error: (error) => {
        this.snackBar.open('Erro ao concluir tarefa', 'Fechar', { duration: 3000 });
      }
    });
  }

  deleteTask(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      this.taskService.deleteTask(id).subscribe({
        next: () => {
          this.snackBar.open('Tarefa excluída com sucesso!', 'Fechar', { duration: 3000 });
          this.loadTasks();
        },
        error: (error) => {
          this.snackBar.open('Erro ao excluir tarefa', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'HIGH': return 'warn';
      case 'MEDIUM': return 'primary';
      case 'LOW': return 'accent';
      default: return 'basic';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'DONE': return 'accent';
      case 'IN_PROGRESS': return 'primary';
      case 'TODO': return 'basic';
      default: return 'basic';
    }
  }

  isOverdue(task: Task): boolean {
    if (!task.deadline || task.status === 'DONE') return false;

    const deadline = new Date(task.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return deadline < today;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Não definido';
    return new Date(dateString).toLocaleDateString('pt-BR');
  }
}
