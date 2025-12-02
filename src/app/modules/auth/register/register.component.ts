// src/app/modules/auth/register/register.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  username = '';
  password = '';
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  register(): void {
    // Validações
    if (!this.username.trim() || !this.password.trim() || !this.confirmPassword.trim()) {
      this.showError('Por favor, preencha todos os campos');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.showError('As senhas não coincidem');
      return;
    }

    if (this.password.length < 6) {
      this.showError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register({
      username: this.username.trim(),
      password: this.password.trim()
    }).subscribe({
      next: () => {
        this.showSuccess('Cadastro realizado com sucesso! Redirecionando...');
        setTimeout(() => {
          this.router.navigate(['/tasks']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 400) {
          this.errorMessage = error.error || 'Usuário já existe';
        } else if (error.status === 0) {
          this.errorMessage = 'Servidor não está respondendo. Verifique se o backend está rodando.';
        } else {
          this.errorMessage = error.error?.message || 'Erro ao realizar cadastro. Tente novamente.';
        }
        this.showError(this.errorMessage);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  registerAsTestUser(): void {
    // Para desenvolvimento rápido
    this.username = 'usuario_teste_' + Math.floor(Math.random() * 1000);
    this.password = 'senha123';
    this.confirmPassword = 'senha123';
    this.register();
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

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !this.isLoading) {
      this.register();
    }
  }
}
