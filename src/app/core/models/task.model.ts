// src/app/core/models/task.model.ts

// Interface para criar/atualizar tarefas (conforme backend)
export interface TaskRequest {
  title: string;
  description?: string;
  responsible?: string;
  priority?: TaskPriority;
  deadline?: string; // Formato: yyyy-MM-dd
  status?: TaskStatus;
  userId?: number; // Apenas para criação, não para atualização
}

// Interface para resposta do backend
export interface TaskResponse {
  id: number;
  title: string;
  description?: string;
  responsible?: string;
  priority: TaskPriority;
  deadline?: string;
  status: TaskStatus;
  user: {
    id: number;
    username: string;
    role: 'ROLE_USER' | 'ROLE_ADMIN';
  };
  createdAt: string;
  updatedAt: string;
}

// Interface User
export interface User {
  id?: number;
  username: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN';
}

// Enums para uso nos componentes
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

// Funções utilitárias
export function formatDateForBackend(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createDefaultTaskRequest(): TaskRequest {
  return {
    title: '',
    description: '',
    responsible: '',
    priority: 'MEDIUM',
    status: 'TODO',
    deadline: undefined
  };
}

export function createTaskRequestForUpdate(task: TaskResponse): TaskRequest {
  return {
    title: task.title,
    description: task.description,
    responsible: task.responsible,
    priority: task.priority,
    status: task.status,
    deadline: task.deadline,
    // NÃO incluir userId em atualizações
  };
}

// Funções para traduzir valores
export function getPriorityDisplay(priority: TaskPriority): string {
  const priorityMap: Record<TaskPriority, string> = {
    'LOW': 'Baixa',
    'MEDIUM': 'Média',
    'HIGH': 'Alta'
  };
  return priorityMap[priority] || priority;
}

export function getStatusDisplay(status: TaskStatus): string {
  const statusMap: Record<TaskStatus, string> = {
    'TODO': 'A Fazer',
    'IN_PROGRESS': 'Em Progresso',
    'DONE': 'Concluída'
  };
  return statusMap[status] || status;
}