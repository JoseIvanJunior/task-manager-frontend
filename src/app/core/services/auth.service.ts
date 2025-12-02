// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/task.model';

interface LoginResponse {
  token: string;
  tokenType: string;
  role: string;
  userId?: number;
  id?: number;
  username?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCurrentUser();
  }

  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('role', response.role);
          localStorage.setItem('username', credentials.username);
          
          // Tentar obter userId da resposta ou do token
          let userId = response.userId || response.id;
          
          if (!userId && response.token) {
            try {
              const payload = JSON.parse(atob(response.token.split('.')[1]));
              userId = payload.userId || payload.id || parseInt(payload.sub);
            } catch (e) {
              console.warn('Não foi possível extrair userId do token:', e);
            }
          }
          
          if (userId) {
            localStorage.setItem('userId', userId.toString());
          }

          const user: User = {
            username: credentials.username,
            role: response.role as 'ROLE_USER' | 'ROLE_ADMIN'
          };

          if (userId) {
            user.id = userId;
          }

          this.currentUserSubject.next(user);
        }
      })
    );
  }

  register(credentials: { username: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, credentials);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  isAdmin(): boolean {
    return this.getRole() === 'ROLE_ADMIN';
  }

  getCurrentUser(): User | null {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const userIdStr = localStorage.getItem('userId');

    if (username && role) {
      const user: User = {
        username,
        role: role as 'ROLE_USER' | 'ROLE_ADMIN'
      };

      if (userIdStr) {
        user.id = parseInt(userIdStr, 10);
      } else {
        // Tentar obter do token como fallback
        const token = this.getToken();
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const tokenUserId = payload.userId || payload.id || parseInt(payload.sub);
            if (tokenUserId) {
              user.id = tokenUserId;
              localStorage.setItem('userId', tokenUserId.toString());
            }
          } catch (e) {
            console.warn('Erro ao decodificar token:', e);
          }
        }
      }

      return user;
    }
    return null;
  }

  getCurrentUserId(): number | null {
    const userIdStr = localStorage.getItem('userId');
    if (userIdStr) {
      return parseInt(userIdStr, 10);
    }
    
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.userId || payload.id || parseInt(payload.sub);
        if (userId) {
          localStorage.setItem('userId', userId.toString());
          return userId;
        }
      } catch (e) {
        console.warn('Erro ao decodificar token:', e);
      }
    }
    
    return null;
  }

  private loadCurrentUser(): void {
    const user = this.getCurrentUser();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }
}