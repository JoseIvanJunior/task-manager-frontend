// src/app/modules/task/task-form/task-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';

import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';
import { TaskRequest, TaskResponse } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatCardModule
  ],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  isEditMode = false;
  taskId?: number;
  isLoading = false;
  currentUserId?: number;

  // Prioridades conforme backend
  priorities = [
    { value: 'LOW', label: 'Baixa' },
    { value: 'MEDIUM', label: 'Média' },
    { value: 'HIGH', label: 'Alta' }
  ];

  // Status conforme backend
  statuses = [
    { value: 'TODO', label: 'A Fazer' },
    { value: 'IN_PROGRESS', label: 'Em Progresso' },
    { value: 'DONE', label: 'Concluída' }
  ];

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      responsible: [''],
      priority: ['MEDIUM', Validators.required],
      status: ['TODO', Validators.required],
      deadline: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    // Obter o ID do usuário logado
    this.getCurrentUserId();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.taskId = +params['id'];
        this.loadTaskForEdit(this.taskId);
      }
    });
  }

  getCurrentUserId(): void {
    const token = this.authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUserId = payload.userId || payload.id || parseInt(payload.sub) || 1;
        console.log('Usuário logado ID:', this.currentUserId);
      } catch (e) {
        console.warn('Não foi possível obter ID do usuário do token:', e);
        const currentUser = this.authService.getCurrentUser();
        if (currentUser?.id) {
          this.currentUserId = currentUser.id;
        } else {
          this.currentUserId = 1;
        }
      }
    } else {
      console.warn('Token não encontrado');
      const currentUser = this.authService.getCurrentUser();
      if (currentUser?.id) {
        this.currentUserId = currentUser.id;
      }
    }
  }

  loadTaskForEdit(taskId: number): void {
    console.log(`Carregando tarefa ${taskId} para edição`);
    this.isLoading = true;

    this.taskService.getById(taskId).subscribe({
      next: (task: TaskResponse) => {
        console.log('Tarefa carregada:', task);
        this.isLoading = false;

        this.taskForm.patchValue({
          title: task.title,
          description: task.description || '',
          responsible: task.responsible || '',
          priority: task.priority,
          status: task.status,
          deadline: task.deadline ? new Date(task.deadline) : null
        });
      },
      error: (error: any) => {
        console.error('Erro ao carregar tarefa:', error);
        this.isLoading = false;
        this.snackBar.open('Erro ao carregar tarefa', 'Fechar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.router.navigate(['/tasks']);
      }
    });
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      console.log('Formulário válido, enviando...');
      this.isLoading = true;

      // Formatar data para yyyy-MM-dd
      const formValue = this.taskForm.value;
      const formattedDeadline = formValue.deadline
        ? this.formatDateForBackend(formValue.deadline)
        : undefined;

      // Criar TaskRequest
      const taskRequest: TaskRequest = {
        title: formValue.title,
        description: formValue.description || undefined,
        responsible: formValue.responsible || undefined,
        priority: formValue.priority,
        status: formValue.status,
        deadline: formattedDeadline
      };

      // Apenas para criação nova, enviar userId
      if (!this.isEditMode && this.currentUserId) {
        taskRequest.userId = this.currentUserId;
      }

      console.log('TaskRequest a ser enviado:', taskRequest);
      console.log('isEditMode:', this.isEditMode);

      if (this.isEditMode && this.taskId) {
        this.updateTask(this.taskId, taskRequest);
      } else {
        this.createTask(taskRequest);
      }
    } else {
      console.log('Formulário inválido');
      this.markFormGroupTouched(this.taskForm);
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios', 'Fechar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  createTask(taskRequest: TaskRequest): void {
    console.log('Criando nova tarefa...');

    this.taskService.create(taskRequest).subscribe({
      next: (createdTask: TaskResponse) => {
        console.log('✅ Tarefa criada com sucesso:', createdTask);
        
        // Usar setTimeout para evitar ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.isLoading = false;
          this.snackBar.open('Tarefa criada com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/tasks']);
        });
      },
      error: (error: any) => {
        console.error('❌ Erro ao criar tarefa:', error);
        
        // Usar setTimeout para evitar ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.isLoading = false;
          this.showError('Erro ao criar tarefa', error);
        });
      }
    });
  }

  updateTask(taskId: number, taskRequest: TaskRequest): void {
    console.log(`Atualizando tarefa ${taskId}...`);
    console.log('TaskRequest (sem userId):', taskRequest);

    this.taskService.update(taskId, taskRequest).subscribe({
      next: (updatedTask: TaskResponse) => {
        console.log('✅ Tarefa atualizada com sucesso:', updatedTask);
        
        // Navegar primeiro, depois mostrar mensagem e limpar loading
        this.router.navigate(['/tasks', taskId]).then(() => {
          // Usar setTimeout para garantir que a navegação foi concluída
          setTimeout(() => {
            this.isLoading = false;
            this.snackBar.open('Tarefa atualizada com sucesso!', 'Fechar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          });
        });
      },
      error: (error: any) => {
        console.error('❌ Erro ao atualizar tarefa:', error);
        
        // Usar setTimeout para evitar ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.isLoading = false;
          this.showError('Erro ao atualizar tarefa', error);
        });
      }
    });
  }

  cancel(): void {
    if (this.isEditMode && this.taskId) {
      this.router.navigate(['/tasks', this.taskId]);
    } else {
      this.router.navigate(['/tasks']);
    }
  }

  private formatDateForBackend(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private showError(message: string, error?: any): void {
    let errorMessage = message;

    if (error) {
      console.error('Detalhes do erro:', error);

      if (error.status === 400) {
        errorMessage += ': Dados inválidos. Verifique os campos.';
        if (error.error) {
          const errors = error.error;
          if (typeof errors === 'string') {
            errorMessage += ` ${errors}`;
          } else if (error.error.message) {
            errorMessage += `: ${error.error.message}`;
          }
        }
      } else if (error.status === 403) {
        errorMessage += ': Acesso negado. ';
        if (this.isEditMode) {
          errorMessage += 'Você não tem permissão para editar esta tarefa.';
        } else {
          errorMessage += 'Você não tem permissão para criar tarefas.';
        }
        
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          errorMessage += ` Usuário: ${currentUser.username}`;
        }
      } else if (error.status === 404) {
        errorMessage += ': Tarefa não encontrada.';
      } else if (error.status === 401) {
        errorMessage += ': Não autenticado. Faça login novamente.';
        this.authService.logout();
        this.router.navigate(['/login']);
      } else if (error.error?.message) {
        errorMessage += `: ${error.error.message}`;
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }
    }

    this.snackBar.open(errorMessage, 'Fechar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get title() { return this.taskForm.get('title'); }
  get description() { return this.taskForm.get('description'); }
  get responsible() { return this.taskForm.get('responsible'); }
  get priority() { return this.taskForm.get('priority'); }
  get status() { return this.taskForm.get('status'); }
  get deadline() { return this.taskForm.get('deadline'); }
}