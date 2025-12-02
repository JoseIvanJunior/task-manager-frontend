// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`; // CORRIGIDO: usa environment.apiUrl
  private tokenKey = 'auth_token';
  private currentUserSubject = new BehaviorSubject<string | null>(null);

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    console.log('AuthService inicializado. API URL:', this.apiUrl);

    const token = this.getToken();
    if (token) {
      const username = this.getUsernameFromToken(token);
      this.currentUserSubject.next(username);
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('Tentando login em:', `${this.apiUrl}/login`);
    console.log('Credenciais:', credentials);

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap({
          next: (response) => {
            console.log('Login bem-sucedido:', response);
            this.setToken(response.token);
            const username = this.getUsernameFromToken(response.token);
            this.currentUserSubject.next(username);
          },
          error: (error) => {
            console.error('Erro no login:', error);
          }
        })
      );
  }

  register(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('Tentando registro em:', `${this.apiUrl}/register`);
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, credentials)
      .pipe(
        tap(response => {
          console.log('Registro bem-sucedido:', response);
          this.setToken(response.token);
          const username = this.getUsernameFromToken(response.token);
          this.currentUserSubject.next(username);
        })
      );
  }

  createAdmin(credentials: LoginRequest): Observable<any> {
    console.log('Criando admin em:', `${this.apiUrl}/create-admin`);
    return this.http.post(`${this.apiUrl}/create-admin`, credentials);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUsername(): string | null {
    return this.currentUserSubject.value;
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  getCurrentUser(): string | null {
    return this.currentUserSubject.value;
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || null;
    } catch {
      return null;
    }
  }

  isAdmin(): boolean {
    const role = this.getUserRole();
    return role === 'ROLE_ADMIN';
  }

  logout(): void {
    this.removeToken();
    this.router.navigate(['/login']);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationDate = new Date(payload.exp * 1000);
      return expirationDate <= new Date();
    } catch {
      return true;
    }
  }

  private getUsernameFromToken(token: string): string {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || '';
    } catch {
      return '';
    }
  }

  // Método para testar a conexão
  testConnection(): Observable<any> {
    console.log('Testando conexão com:', this.apiUrl);
    return this.http.get(`${this.apiUrl}/health`).pipe(
      tap({
        next: (response) => console.log('Conexão OK:', response),
        error: (error) => console.error('Erro na conexão:', error)
      })
    );
  }
}
