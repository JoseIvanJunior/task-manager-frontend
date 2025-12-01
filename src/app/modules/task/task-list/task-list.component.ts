import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TaskService } from '../../../core/services/task.service';
import { Task, Priority, Status, PriorityDisplay, StatusDisplay } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    DatePipe
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  displayedColumns: string[] = ['title', 'responsible', 'priority', 'deadline', 'status', 'actions'];

  filters = {
    responsible: '',
    priority: null as Priority | null,
    status: null as Status | null
  };

  priorities = Object.values(Priority);
  statuses = Object.values(Status);
  priorityDisplay = PriorityDisplay;
  statusDisplay = StatusDisplay;

  isLoading = false;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.taskService.getAllTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar tarefas:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredTasks = this.tasks.filter(task => {
      const matchesResponsible = !this.filters.responsible ||
        task.responsible.toLowerCase().includes(this.filters.responsible.toLowerCase());

      const matchesPriority = !this.filters.priority ||
        task.priority === this.filters.priority;

      const matchesStatus = !this.filters.status ||
        task.status === this.filters.status;

      return matchesResponsible && matchesPriority && matchesStatus;
    });
  }

  clearFilters(): void {
    this.filters = {
      responsible: '',
      priority: null,
      status: null
    };
    this.applyFilters();
  }

  deleteTask(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      this.taskService.deleteTask(id).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(task => task.id !== id);
          this.applyFilters();
        },
        error: (error) => console.error('Erro ao excluir tarefa:', error)
      });
    }
  }

  completeTask(id: number): void {
    this.taskService.completeTask(id).subscribe({
      next: (updatedTask) => {
        const index = this.tasks.findIndex(task => task.id === id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
          this.applyFilters();
        }
      },
      error: (error) => console.error('Erro ao completar tarefa:', error)
    });
  }

  getPriorityDisplay(priority: Priority): string {
    return PriorityDisplay[priority] || priority;
  }

  getStatusDisplay(status: Status): string {
    return StatusDisplay[status] || status;
  }
}
