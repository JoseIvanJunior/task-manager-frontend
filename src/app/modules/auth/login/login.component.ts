import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {
    const mockUser = {
      id: 1,
      username: this.username || 'teste',
      token: 'mock-jwt-token-' + Date.now()
    };

    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    localStorage.setItem('token', mockUser.token);

    this.router.navigate(['/tasks']);
  }

  loginAsTestUser(): void {
    this.username = 'usuario_teste';
    this.password = 'senha123';
    this.login();
  }
}
