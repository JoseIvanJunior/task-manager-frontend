// src/app/core/interceptors/auth.interceptor.ts
import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private snackBar = inject(MatSnackBar); // Adicionar MatSnackBar

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('Interceptor executando para URL:', req.url);
    
    const token = this.authService.getToken();
    console.log('Token disponível:', token ? 'Sim' : 'Não');
    
    // Clone a requisição e adiciona o token se existir
    let authReq = req;
    if (token) {
      console.log('Adicionando token à requisição');
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erro HTTP no interceptor:', error);
        
        if (error.status === 401) {
          console.log('Erro 401 - Não autorizado');
          this.authService.logout();
          this.router.navigate(['/login'], {
            queryParams: { 
              error: 'Sessão expirada. Por favor, faça login novamente.'
            }
          });
        } else if (error.status === 403) {
          console.log('Erro 403 - Acesso negado');
          // Usar snackBar injetado
          this.snackBar.open('Acesso negado. Você não tem permissão para realizar esta ação.', 'Fechar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
        
        return throwError(() => error);
      })
    );
  }
}