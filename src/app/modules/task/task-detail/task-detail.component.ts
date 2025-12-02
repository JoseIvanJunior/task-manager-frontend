// src/app/modules/task/task-detail/task-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Task, TaskPriority, TaskStatus } from './../../../core/models/task.model';
import { TaskService } from './../../../core/services/task.service';
import { AuthService } from './../../../core/services/auth.service';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    CommonModule,
    // RouterLink removido pois não está sendo usado no template
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule  // Adicionado para o mat-spinner
  ],
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss']
})
export class TaskDetailComponent implements OnInit {
  task?: Task;
  taskId!: number;
  isLoading = true;
  isAdmin = false;
  currentUser = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.currentUser = this.authService.getUsername() || '';

    this.route.params.subscribe(params => {
      this.taskId = +params['id'];
      this.loadTask();
    });
  }

  loadTask(): void {
    this.isLoading = true;
    this.taskService.getTaskById(this.taskId).subscribe({
      next: (task) => {
        this.task = task;
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Erro ao carregar tarefa', 'Fechar', { duration: 3000 });
        this.router.navigate(['/tasks']);
      }
    });
  }

  // Métodos adicionados para o template
  goBack(): void {
    this.router.navigate(['/tasks']);
  }

  editTask(): void {
    this.router.navigate(['/tasks', this.taskId, 'edit']);
  }

  completeTask(): void {
    if (!this.taskId) return;

    this.taskService.completeTask(this.taskId).subscribe({
      next: (task) => {
        this.task = task;
        this.snackBar.open('Tarefa concluída com sucesso!', 'Fechar', { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open('Erro ao concluir tarefa', 'Fechar', { duration: 3000 });
      }
    });
  }

  deleteTask(): void {
    if (!this.taskId) return;

    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      this.taskService.deleteTask(this.taskId).subscribe({
        next: () => {
          this.snackBar.open('Tarefa excluída com sucesso!', 'Fechar', { duration: 3000 });
          this.router.navigate(['/tasks']);
        },
        error: (error) => {
          this.snackBar.open('Erro ao excluir tarefa', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  canEdit(): boolean {
    if (!this.task) return false;
    return this.isAdmin || this.task.username === this.currentUser;
  }

  // Métodos auxiliares para exibição
  getStatusDisplay(status: string): string {
    switch (status) {
      case 'TODO': return 'A Fazer';
      case 'IN_PROGRESS': return 'Em Progresso';
      case 'DONE': return 'Concluído';
      default: return status;
    }
  }

  getPriorityDisplay(priority: string): string {
    switch (priority) {
      case 'LOW': return 'Baixa';
      case 'MEDIUM': return 'Média';
      case 'HIGH': return 'Alta';
      default: return priority;
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

  isDeadlinePassed(deadline?: string): boolean {
    if (!deadline) return false;
    if (!this.task || this.task.status === 'DONE') return false;

    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return deadlineDate < today;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Não definido';
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'TODO': return 'pending';
      case 'IN_PROGRESS': return 'sync';
      case 'DONE': return 'check_circle';
      default: return 'help';
    }
  }

  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'LOW': return 'arrow_downward';
      case 'MEDIUM': return 'remove';
      case 'HIGH': return 'arrow_upward';
      default: return 'priority_high';
    }
  }
}
