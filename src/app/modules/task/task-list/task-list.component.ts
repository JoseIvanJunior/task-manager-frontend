// src/app/modules/task/task-list/task-list.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';

// Services & Components
import { TaskService } from '../../../core/services/task.service';
import { TaskResponse, TaskPriority, TaskStatus } from '../../../core/models/task.model';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    
    // Material Modules
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  tasks: TaskResponse[] = [];
  filteredTasks: TaskResponse[] = [];
  isLoading = false;
  showFilter = false;
  activeFilterType: 'all' | 'upcoming' | 'overdue' = 'all';

  // Filtros
  filter = {
    status: '',
    priority: '',
    responsible: ''
  };

  // Opções para os selects - CORREÇÃO: Usar LOW, MEDIUM, HIGH
  statuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];
  priorities: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  // Carregar todas as tarefas
  loadTasks(): void {
    this.isLoading = true;
    this.activeFilterType = 'all';
    this.clearFilterValues();

    this.taskService.getAll().subscribe({
      next: (tasks: TaskResponse[]) => {
        this.tasks = tasks;
        this.filteredTasks = [...tasks];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Erro ao carregar tarefas:', error);
        this.isLoading = false;
        this.showError('Erro ao carregar tarefas');
        this.cdr.detectChanges();
      }
    });
  }

  // Carregar tarefas próximas (próximos 7 dias)
  loadUpcomingTasks(): void {
    this.isLoading = true;
    this.activeFilterType = 'upcoming';
    this.clearFilterValues();

    this.taskService.getUpcoming().subscribe({
      next: (tasks: TaskResponse[]) => {
        this.tasks = tasks;
        this.filteredTasks = tasks;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Erro ao carregar tarefas próximas:', error);
        this.isLoading = false;
        this.showError('Erro ao carregar tarefas próximas');
        this.loadTasks(); // Fallback para todas as tarefas
      }
    });
  }

  // Carregar tarefas atrasadas
  loadOverdueTasks(): void {
    this.isLoading = true;
    this.activeFilterType = 'overdue';
    this.clearFilterValues();

    this.taskService.getOverdue().subscribe({
      next: (tasks: TaskResponse[]) => {
        this.tasks = tasks;
        this.filteredTasks = tasks;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Erro ao carregar tarefas atrasadas:', error);
        this.isLoading = false;
        this.showError('Erro ao carregar tarefas atrasadas');
        this.loadTasks(); // Fallback para todas as tarefas
      }
    });
  }

  // Aplicar filtros manuais
  applyFilter(): void {
    this.filteredTasks = this.tasks.filter(task => {
      let matches = true;

      if (this.filter.status && task.status !== this.filter.status) {
        matches = false;
      }

      if (this.filter.priority && task.priority !== this.filter.priority) {
        matches = false;
      }

      if (this.filter.responsible && task.responsible) {
        if (!task.responsible.toLowerCase().includes(this.filter.responsible.toLowerCase())) {
          matches = false;
        }
      }

      return matches;
    });

    this.cdr.detectChanges();
  }

  // Marcar tarefa como concluída
  completeTask(id: number): void {
    this.taskService.complete(id).subscribe({
      next: (task: TaskResponse) => {
        // Atualizar a tarefa na lista
        const index = this.tasks.findIndex(t => t.id === id);
        if (index !== -1) {
          this.tasks[index] = task;
        }
        
        // Atualizar também nas tarefas filtradas
        const filteredIndex = this.filteredTasks.findIndex(t => t.id === id);
        if (filteredIndex !== -1) {
          this.filteredTasks[filteredIndex] = task;
        }
        
        this.showSuccess('Tarefa marcada como concluída!');
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Erro ao completar tarefa:', error);
        this.showError('Erro ao completar tarefa');
      }
    });
  }

  // Excluir tarefa com confirmação
  deleteTask(id: number): void {
    const dialogData: ConfirmDialogData = {
      title: 'Confirmar exclusão',
      message: 'Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.',
      confirmText: 'Excluir',
      cancelText: 'Cancelar'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taskService.delete(id).subscribe({
          next: () => {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.filteredTasks = this.filteredTasks.filter(task => task.id !== id);
            this.showSuccess('Tarefa excluída com sucesso!');
            this.cdr.detectChanges();
          },
          error: (error: any) => {
            console.error('Erro ao excluir tarefa:', error);
            this.showError('Erro ao excluir tarefa');
          }
        });
      }
    });
  }

  // Limpar filtros manuais
  clearFilter(): void {
    this.clearFilterValues();
    
    // Recarregar as tarefas conforme o tipo de filtro ativo
    if (this.activeFilterType === 'upcoming') {
      this.loadUpcomingTasks();
    } else if (this.activeFilterType === 'overdue') {
      this.loadOverdueTasks();
    } else {
      this.filteredTasks = [...this.tasks];
    }
  }

  private clearFilterValues(): void {
    this.filter = { status: '', priority: '', responsible: '' };
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
  }

  getListTitle(): string {
    if (this.hasActiveFilters()) {
      return 'Tarefas Filtradas';
    } else if (this.activeFilterType === 'upcoming') {
      return 'Próximas Tarefas (7 dias)';
    } else if (this.activeFilterType === 'overdue') {
      return 'Tarefas Atrasadas';
    } else {
      return 'Todas as Tarefas';
    }
  }

  hasActiveFilters(): boolean {
    return !!this.filter.status || !!this.filter.priority || !!this.filter.responsible;
  }

  // Traduções - CORREÇÃO: Mapear LOW, MEDIUM, HIGH
  getStatusDisplay(status: TaskStatus | string): string {
    const statusMap: Record<TaskStatus, string> = {
      'TODO': 'A Fazer',
      'IN_PROGRESS': 'Em Progresso',
      'DONE': 'Concluída'
    };
    return statusMap[status as TaskStatus] || status;
  }

  getPriorityDisplay(priority: TaskPriority | string): string {
    const priorityMap: Record<TaskPriority, string> = {
      'LOW': 'Baixa',
      'MEDIUM': 'Média',
      'HIGH': 'Alta'
    };
    return priorityMap[priority as TaskPriority] || priority;
  }

  getPriorityColor(priority: TaskPriority | string): string {
    const colorMap: Record<TaskPriority, string> = {
      'LOW': 'primary',
      'MEDIUM': 'accent',
      'HIGH': 'warn'
    };
    return colorMap[priority as TaskPriority] || 'primary';
  }

  getStatusColor(status: TaskStatus | string): string {
    const colorMap: Record<TaskStatus, string> = {
      'TODO': 'warn',
      'IN_PROGRESS': 'accent',
      'DONE': 'primary'
    };
    return colorMap[status as TaskStatus] || 'primary';
  }

  isOverdue(task: TaskResponse): boolean {
    if (task.status === 'DONE') {
      return false;
    }

    if (!task.deadline) {
      return false;
    }

    try {
      const deadline = new Date(task.deadline);
      const today = new Date();
      
      // Resetar horas para comparar apenas datas
      today.setHours(0, 0, 0, 0);
      deadline.setHours(0, 0, 0, 0);

      return deadline < today;
    } catch {
      return false;
    }
  }

  formatDate(dateValue?: string): string {
    if (!dateValue) {
      return 'Não informada';
    }

    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Data inválida';
    }
  }

  canEdit(task: TaskResponse): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;
    
    // Admin pode editar tudo
    if (currentUser.role === 'ROLE_ADMIN') return true;
    
    // Usuário comum só edita suas próprias tarefas
    return task.user?.username === currentUser.username;
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }
}