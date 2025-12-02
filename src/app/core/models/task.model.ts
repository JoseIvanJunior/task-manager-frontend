// src/app/core/models/task.model.ts

// Interface principal da tarefa
export interface Task {
  id?: number;
  title: string;
  description?: string;
  responsible: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  deadline?: string;
  userId?: number;
  username?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Request para criar/atualizar tarefa
export interface TaskRequest {
  title: string;
  description?: string;
  responsible: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
  deadline?: string;
  userId?: number;
}

// Filtro para tarefas
export interface TaskFilter {
  status?: string;
  priority?: string;
  responsible?: string;
  startDate?: string;
  endDate?: string;
}

// Enums separados para facilitar o uso
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

// Função auxiliar para formatar datas
export function formatDate(dateString?: string): string {
  if (!dateString) return 'Não definido';
  return new Date(dateString).toLocaleDateString('pt-BR');
}
