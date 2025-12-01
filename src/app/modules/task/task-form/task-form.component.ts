import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

import { TaskService } from '../../../core/services/task.service';
import { Task, Priority, Status, PriorityDisplay, StatusDisplay } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule
  ],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit {
  isEditMode = false;
  taskId?: number;
  task: Task = {
    title: '',
    description: '',
    responsible: '',
    priority: Priority.MEDIUM,
    deadline: new Date().toISOString().split('T')[0],
    status: Status.IN_PROGRESS
  };

  minDate = new Date();
  priorities = Object.values(Priority);
  statuses = Object.values(Status);

  constructor(
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.taskId = +id;
      this.loadTask(this.taskId);
    }
  }

  loadTask(id: number): void {
    this.taskService.getTaskById(id).subscribe({
      next: (task) => {
        this.task = task;
      },
      error: (error) => {
        console.error('Erro ao carregar tarefa:', error);
      }
    });
  }

  saveTask(): void {
    if (this.isEditMode && this.taskId) {
      this.taskService.updateTask(this.taskId, this.task).subscribe({
        next: () => {
          this.router.navigate(['/tasks']);
        },
        error: (error) => console.error('Erro ao atualizar:', error)
      });
    } else {
      this.taskService.createTask(this.task).subscribe({
        next: () => {
          this.router.navigate(['/tasks']);
        },
        error: (error) => console.error('Erro ao criar:', error)
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/tasks']);
  }

  voltarParaLista() {
    this.router.navigate(['/tasks']);
  }

  // Métodos para exibição
  getPriorityDisplay(priority: string): string {
    return PriorityDisplay[priority as keyof typeof PriorityDisplay] || priority;
  }

  getStatusDisplay(status: string): string {
    return StatusDisplay[status as keyof typeof StatusDisplay] || status;
  }
}
