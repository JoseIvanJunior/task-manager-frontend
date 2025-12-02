import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { TaskService } from '../../../core/services/task.service';
import { TaskResponse, TaskStatus, TaskPriority } from '../../../core/models/task.model';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Subscription } from 'rxjs';

// Interface local para compatibilidade
interface TaskDisplay {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline?: string;
  responsible?: string;
  createdBy?: User;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
  category?: string;
  tags?: string[];
}

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatDividerModule,
    MatDialogModule
  ],
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss']
})
export class TaskDetailComponent implements OnInit, OnDestroy {
  task: TaskDisplay | null = null;
  taskId: string = '';
  isLoading = false;
  currentUser: User | null = null;
  private subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private authService: AuthService,
    private location: Location,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef // Adicionado ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // Converter string para number para o serviço
      this.taskId = id;
      this.loadCurrentUser();
      this.loadTask();
    } else {
      this.showError('ID da tarefa não encontrado');
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadCurrentUser(): void {
    const userSub = this.authService.currentUser$.subscribe({
      next: (user) => {
        this.currentUser = user;
        this.cdr.detectChanges(); // Detectar mudanças
      },
      error: (error) => {
        console.error('Erro ao carregar usuário:', error);
        this.currentUser = null;
        this.cdr.detectChanges();
      }
    });
    this.subscriptions.add(userSub);
  }

  loadTask(): void {
    if (!this.taskId) {
      this.showError('ID da tarefa inválido');
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges(); // Atualizar imediatamente

    // Converter string para number
    const taskIdNumber = Number(this.taskId);
    if (isNaN(taskIdNumber)) {
      // Usar setTimeout para evitar ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.isLoading = false;
        this.showError('ID da tarefa inválido');
        this.cdr.detectChanges();
      });
      return;
    }

    const taskSub = this.taskService.getById(taskIdNumber).subscribe({
      next: (taskResponse: TaskResponse) => {
        // Converter TaskResponse para TaskDisplay
        this.task = this.convertToTaskDisplay(taskResponse);
        
        // Usar setTimeout para evitar ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (error: any) => {
        console.error('Erro ao carregar tarefa:', error);
        
        // Usar setTimeout para evitar ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.isLoading = false;
          this.showError('Erro ao carregar tarefa');
          this.cdr.detectChanges();
        });
      }
    });
    this.subscriptions.add(taskSub);
  }

  completeTask(): void {
    if (!this.task || !this.taskId) return;

    this.isLoading = true;
    this.cdr.detectChanges();

    const taskIdNumber = Number(this.taskId);
    if (isNaN(taskIdNumber)) {
      setTimeout(() => {
        this.isLoading = false;
        this.showError('ID da tarefa inválido');
        this.cdr.detectChanges();
      });
      return;
    }

    const completeSub = this.taskService.complete(taskIdNumber).subscribe({
      next: (taskResponse: TaskResponse) => {
        // Atualizar a tarefa com a resposta
        this.task = this.convertToTaskDisplay(taskResponse);
        
        setTimeout(() => {
          this.isLoading = false;
          this.showSuccess('Tarefa marcada como concluída!');
          this.cdr.detectChanges();
        });
      },
      error: (error: any) => {
        console.error('Erro ao completar tarefa:', error);
        
        setTimeout(() => {
          this.isLoading = false;
          this.showError('Erro ao completar tarefa');
          this.cdr.detectChanges();
        });
      }
    });
    this.subscriptions.add(completeSub);
  }

  deleteTask(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar exclusão',
        message: 'Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.',
        confirmText: 'Excluir',
        cancelText: 'Cancelar',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.taskId) {
        this.isLoading = true;
        this.cdr.detectChanges();
        
        const taskIdNumber = Number(this.taskId);
        if (isNaN(taskIdNumber)) {
          setTimeout(() => {
            this.isLoading = false;
            this.showError('ID da tarefa inválido');
            this.cdr.detectChanges();
          });
          return;
        }

        const deleteSub = this.taskService.delete(taskIdNumber).subscribe({
          next: () => {
            setTimeout(() => {
              this.isLoading = false;
              this.showSuccess('Tarefa excluída com sucesso!');
              this.cdr.detectChanges();
              this.router.navigate(['/tasks']);
            });
          },
          error: (error: any) => {
            setTimeout(() => {
              this.isLoading = false;
              console.error('Erro ao excluir tarefa:', error);
              this.showError('Erro ao excluir tarefa');
              this.cdr.detectChanges();
            });
          }
        });
        this.subscriptions.add(deleteSub);
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  editTask(): void {
    if (this.taskId) {
      this.router.navigate(['/tasks', this.taskId, 'edit']);
    }
  }

  // Método para converter TaskResponse para TaskDisplay
  private convertToTaskDisplay(taskResponse: TaskResponse): TaskDisplay {
    const createdBy: User = {
      id: taskResponse.user.id,
      username: taskResponse.user.username,
      role: taskResponse.user.role,
      name: taskResponse.user.username
    };

    // Determinar se a tarefa está concluída
    const isCompleted = taskResponse.status === 'DONE';

    return {
      id: taskResponse.id.toString(),
      title: taskResponse.title,
      description: taskResponse.description,
      status: taskResponse.status,
      priority: taskResponse.priority,
      deadline: taskResponse.deadline,
      responsible: taskResponse.responsible,
      createdBy: createdBy,
      createdAt: taskResponse.createdAt,
      updatedAt: taskResponse.updatedAt,
      completedAt: isCompleted ? taskResponse.updatedAt : undefined
    };
  }

  // Métodos para exibição de status - ATUALIZADO para usar LOW, MEDIUM, HIGH
  getStatusDisplay(status: TaskStatus | string | undefined): string {
    if (!status) return 'Não definido';
    
    const statusMap: Record<string, string> = {
      'TODO': 'A Fazer',
      'IN_PROGRESS': 'Em Progresso',
      'DONE': 'Concluída',
      'PENDING': 'Pendente',
      'COMPLETED': 'Concluída'
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: TaskStatus | string | undefined): 'primary' | 'accent' | 'warn' {
    if (!status) return 'primary';
    
    const colorMap: Record<string, 'primary' | 'accent' | 'warn'> = {
      'TODO': 'warn',
      'IN_PROGRESS': 'accent',
      'DONE': 'primary',
      'PENDING': 'warn',
      'COMPLETED': 'primary'
    };
    return colorMap[status] || 'primary';
  }

  getStatusIcon(status: TaskStatus | string | undefined): string {
    if (!status) return 'help_outline';
    
    const iconMap: Record<string, string> = {
      'TODO': 'pending_actions',
      'IN_PROGRESS': 'autorenew',
      'DONE': 'check_circle',
      'PENDING': 'pending_actions',
      'COMPLETED': 'check_circle'
    };
    return iconMap[status] || 'help_outline';
  }

  // Métodos para exibição de prioridade - ATUALIZADO para usar LOW, MEDIUM, HIGH
  getPriorityDisplay(priority: TaskPriority | string | undefined): string {
    if (!priority) return 'Não definida';
    
    const priorityMap: Record<string, string> = {
      'LOW': 'Baixa',
      'MEDIUM': 'Média',
      'HIGH': 'Alta',
      'BAIXA': 'Baixa', // Mantido para compatibilidade
      'MEDIA': 'Média', // Mantido para compatibilidade
      'ALTA': 'Alta', // Mantido para compatibilidade
      'low': 'Baixa',
      'medium': 'Média',
      'high': 'Alta'
    };
    return priorityMap[priority] || priority;
  }

  getPriorityColor(priority: TaskPriority | string | undefined): 'primary' | 'accent' | 'warn' {
    if (!priority) return 'primary';
    
    const colorMap: Record<string, 'primary' | 'accent' | 'warn'> = {
      'LOW': 'primary',
      'MEDIUM': 'accent',
      'HIGH': 'warn',
      'BAIXA': 'primary', // Mantido para compatibilidade
      'MEDIA': 'accent', // Mantido para compatibilidade
      'ALTA': 'warn', // Mantido para compatibilidade
      'low': 'primary',
      'medium': 'accent',
      'high': 'warn'
    };
    return colorMap[priority] || 'primary';
  }

  getPriorityIcon(priority: TaskPriority | string | undefined): string {
    if (!priority) return 'help_outline';
    
    const iconMap: Record<string, string> = {
      'LOW': 'arrow_downward',
      'MEDIUM': 'remove',
      'HIGH': 'arrow_upward',
      'BAIXA': 'arrow_downward', // Mantido para compatibilidade
      'MEDIA': 'remove', // Mantido para compatibilidade
      'ALTA': 'arrow_upward', // Mantido para compatibilidade
      'low': 'arrow_downward',
      'medium': 'remove',
      'high': 'arrow_upward'
    };
    return iconMap[priority] || 'help_outline';
  }

  // Métodos para datas
  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Não definido';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';
      
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data inválida';
    }
  }

  formatSimpleDate(dateString: string | undefined): string {
    if (!dateString) return 'Não definido';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';
      
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Data inválida';
    }
  }

  isDeadlinePassed(deadline: string | undefined): boolean {
    if (!deadline || !this.task) return false;
    
    try {
      const deadlineDate = new Date(deadline);
      const today = new Date();
      
      if (isNaN(deadlineDate.getTime())) return false;
      
      // Compara apenas a data (ignora horas)
      deadlineDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      // Verificar se a tarefa está concluída
      const isDone = this.task.status === 'DONE';
      return deadlineDate < today && !isDone;
    } catch {
      return false;
    }
  }

  // Verificar se a tarefa está concluída
  isTaskCompleted(): boolean {
    return this.task?.status === 'DONE';
  }

  // Método para verificar permissão de edição
  canEdit(): boolean {
    if (!this.task || !this.currentUser) return false;

    // Admin pode editar tudo
    if (this.currentUser.role === 'ROLE_ADMIN') return true;

    // Verifica se o usuário atual é o responsável
    if (this.task.responsible && this.currentUser.username === this.task.responsible) return true;

    // Verifica se o usuário atual é o criador
    if (this.task.createdBy && this.currentUser.id === this.task.createdBy.id) return true;

    return false;
  }

  canDelete(): boolean {
    if (!this.task || !this.currentUser) return false;

    // Apenas admin pode deletar
    return this.currentUser.role === 'ROLE_ADMIN';
  }

  canComplete(): boolean {
    if (!this.task || !this.currentUser) return false;

    // Não pode completar se já estiver concluída
    if (this.isTaskCompleted()) return false;

    // Qualquer usuário pode completar se for responsável ou criador
    if (this.task.responsible && this.currentUser.username === this.task.responsible) return true;
    if (this.task.createdBy && this.currentUser.id === this.task.createdBy.id) return true;

    // Admin também pode completar
    return this.currentUser.role === 'ROLE_ADMIN';
  }

  getTaskUser(): string {
    if (!this.task) return 'Não definido';
    
    if (this.task.createdBy) {
      return this.task.createdBy.name || this.task.createdBy.username || 'Usuário';
    }
    
    return 'Não definido';
  }

  getTaskRole(): string {
    if (!this.task?.createdBy?.role) return '';
    
    const roleMap: Record<string, string> = {
      'ROLE_ADMIN': 'Administrador',
      'ROLE_USER': 'Usuário',
      'ADMIN': 'Administrador',
      'USER': 'Usuário'
    };
    
    return roleMap[this.task.createdBy.role] || this.task.createdBy.role;
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