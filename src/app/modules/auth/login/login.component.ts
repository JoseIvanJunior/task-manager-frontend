// src/app/features/auth/login/login.component.ts
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  hidePassword = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    // Testa a conexão ao iniciar
    this.testBackendConnection();
  }

  private testBackendConnection(): void {
    console.log('Testando conexão com backend...');

    // Teste 1: Direto ao backend (deve falhar por CORS)
    fetch('http://localhost:8081/api/auth/health')
      .then(response => {
        console.log('1. Backend direto (possível CORS):', response.status);
      })
      .catch(error => {
        console.log('1. Backend direto - Erro esperado (CORS):', error.message);
      });

    // Teste 2: Via proxy Angular
    fetch('/api/actuator/health')
      .then(response => {
        console.log('2. Via proxy (Spring Actuator):', response.status);
        if (response.ok) {
          this.showSuccess('Backend conectado via proxy!');
        }
      })
      .catch(error => {
        console.error('2. Erro via proxy:', error);
        this.showError('Proxy não configurado corretamente');
      });

    // Teste 3: Sua API específica
    fetch('/api/auth/health')
      .then(response => {
        console.log('3. API auth via proxy:', response.status);
      })
      .catch(error => {
        console.error('3. Erro API auth:', error);
      });
  }

  login(): void {
    if (!this.username.trim() || !this.password.trim()) {
      this.showError('Por favor, preencha todos os campos');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Força a detecção de mudanças
    this.cdr.detectChanges();

    console.log('Iniciando login...');

    // Usa setTimeout para evitar o ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.authService.login({
        username: this.username.trim(),
        password: this.password.trim()
      }).subscribe({
        next: (response) => {
          console.log('LoginComponent: Login bem-sucedido', response);
          this.isLoading = false;
          this.cdr.detectChanges();
          this.showSuccess('Login realizado com sucesso!');
          this.router.navigate(['/tasks']);
        },
        error: (error) => {
          console.error('LoginComponent: Erro no login', error);
          this.isLoading = false;
          this.cdr.detectChanges();

          // Analisa o erro em detalhes
          if (error.status === 0) {
            this.errorMessage = 'Não foi possível conectar ao servidor. Verifique:';
            this.errorMessage += '\n1. O backend Spring Boot está rodando?';
            this.errorMessage += '\n2. Está na porta 8081?';
            this.errorMessage += '\n3. O proxy está configurado?';
          } else if (error.status === 404) {
            this.errorMessage = `Endpoint não encontrado. Verifique se o backend tem:`;
            this.errorMessage += `\nPOST /api/auth/login`;
            this.errorMessage += `\nURL tentada: ${error.url}`;
          } else if (error.status === 401) {
            this.errorMessage = 'Usuário ou senha inválidos';
          } else if (error.status === 500) {
            this.errorMessage = 'Erro interno no servidor';
          } else {
            this.errorMessage = error.error?.message || `Erro ${error.status}: ${error.statusText}`;
          }

          this.showError(this.errorMessage);

          // Log adicional para debug
          console.log('URL da requisição:', error.url);
          console.log('Status:', error.status);
          console.log('Mensagem:', error.message);
        },
        complete: () => {
          console.log('Login completado');
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }, 0);
  }

  loginAsTestUser(): void {
    this.username = 'usuario_teste';
    this.password = 'senha123';
    this.login();
  }

  testConnection(): void {
    console.log('=== TESTE DE CONEXÃO ===');
    console.log('AuthService API URL:', this.authService['apiUrl']);
    //console.log('Environment API URL:', environment.apiUrl);

    // Testa várias URLs
    const testUrls = [
      'http://localhost:8081/api/auth/login',
      '/api/auth/login',
      '/api/actuator/health',
      'http://localhost:8081/actuator/health'
    ];

    testUrls.forEach(url => {
      console.log(`\nTestando: ${url}`);
      fetch(url, { method: 'GET' })
        .then(response => console.log(`${url}: ${response.status}`))
        .catch(error => console.error(`${url}: ${error.message}`));
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
    this.cdr.detectChanges();
  }

  private showError(message: string): void {
    setTimeout(() => {
      this.snackBar.open(message, 'Fechar', {
        duration: 10000, // 10 segundos para mensagens de erro
        panelClass: ['error-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }, 0);
  }

  private showSuccess(message: string): void {
    setTimeout(() => {
      this.snackBar.open(message, 'Fechar', {
        duration: 3000,
        panelClass: ['success-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }, 0);
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !this.isLoading) {
      this.login();
    }
  }
}
