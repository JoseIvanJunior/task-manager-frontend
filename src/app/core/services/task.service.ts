// src/app/core/services/task.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskRequest, TaskResponse } from '../models/task.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  // GET /api/tasks - Listar todas as tarefas
  getAll(): Observable<TaskResponse[]> {
    return this.http.get<TaskResponse[]>(this.apiUrl);
  }

  // GET /api/tasks/{id} - Obter tarefa por ID
  getById(id: number): Observable<TaskResponse> {
    return this.http.get<TaskResponse>(`${this.apiUrl}/${id}`);
  }

  // POST /api/tasks - Criar nova tarefa
  create(task: TaskRequest): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(this.apiUrl, task);
  }

  // PUT /api/tasks/{id} - Atualizar tarefa existente
  update(id: number, task: TaskRequest): Observable<TaskResponse> {
    return this.http.put<TaskResponse>(`${this.apiUrl}/${id}`, task);
  }

  // PATCH /api/tasks/{id}/complete - Marcar tarefa como concluída
  complete(id: number): Observable<TaskResponse> {
    return this.http.patch<TaskResponse>(`${this.apiUrl}/${id}/complete`, {});
  }

  // DELETE /api/tasks/{id} - Excluir tarefa
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // GET /api/tasks/upcoming - Tarefas próximas (próximos 7 dias)
  getUpcoming(): Observable<TaskResponse[]> {
    return this.http.get<TaskResponse[]>(`${this.apiUrl}/upcoming`);
  }

  // GET /api/tasks/overdue - Tarefas atrasadas
  getOverdue(): Observable<TaskResponse[]> {
    return this.http.get<TaskResponse[]>(`${this.apiUrl}/overdue`);
  }

  // GET /api/tasks/filter - Filtrar tarefas (opcional)
  filter(filters: any): Observable<TaskResponse[]> {
    let params = new HttpParams();
    
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.priority) {
      params = params.set('priority', filters.priority);
    }
    if (filters.responsible) {
      params = params.set('responsible', filters.responsible);
    }

    return this.http.get<TaskResponse[]>(`${this.apiUrl}/filter`, { params });
  }
}