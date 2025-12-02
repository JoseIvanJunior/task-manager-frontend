// src/app/modules/task/task-form/task-form.component.ts
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { Task, TaskRequest, TaskPriority, TaskStatus } from './../../../core/models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']  // Referência ao SCSS separado
})
export class TaskFormComponent implements OnInit {
  @Input() task?: Task;
  @Input() isEditMode = false;
  @Input() isLoading = false;
  @Output() formSubmit = new EventEmitter<TaskRequest>();
  @Output() cancel = new EventEmitter<void>();

  taskForm!: FormGroup;
  priorities = Object.values(TaskPriority);
  statuses = Object.values(TaskStatus);
  today = new Date().toISOString().split('T')[0];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();

    if (this.task && this.isEditMode) {
      this.patchFormValues();
    }
  }

  private initForm(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      responsible: ['', [Validators.required, Validators.maxLength(50)]],
      priority: ['MEDIUM', [Validators.required]],
      status: ['TODO', [Validators.required]],
      deadline: ['']
    });
  }

  private patchFormValues(): void {
    this.taskForm.patchValue({
      title: this.task?.title || '',
      description: this.task?.description || '',
      responsible: this.task?.responsible || '',
      priority: this.task?.priority || 'MEDIUM',
      status: this.task?.status || 'TODO',
      deadline: this.task?.deadline || ''
    });
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      const taskRequest: TaskRequest = {
        title: formValue.title,
        description: formValue.description || undefined,
        responsible: formValue.responsible,
        priority: formValue.priority,
        status: formValue.status,
        deadline: formValue.deadline || undefined
      };
      this.formSubmit.emit(taskRequest);
    } else {
      this.markFormGroupTouched(this.taskForm);
    }
  }

  onCancel(): void {
    this.cancel.emit();
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
