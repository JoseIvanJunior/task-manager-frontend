export enum Priority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum Status {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface Task {
  id?: number;
  title: string;
  description: string;
  responsible: string;
  priority: Priority;
  deadline: string;
  status: Status;
  createdAt?: string;
  updatedAt?: string;
}

export const PriorityDisplay: Record<Priority, string> = {
  [Priority.HIGH]: 'Alta',
  [Priority.MEDIUM]: 'Média',
  [Priority.LOW]: 'Baixa'
};

export const StatusDisplay: Record<Status, string> = {
  [Status.IN_PROGRESS]: 'Em andamento',
  [Status.COMPLETED]: 'Concluída'
};

// Mapeamentos para cores (usado no CSS)
export const PriorityColor: Record<Priority, string> = {
  [Priority.HIGH]: 'alta',
  [Priority.MEDIUM]: 'media',
  [Priority.LOW]: 'baixa'
};
