// src/app/core/interceptors/auth.interceptor.functional.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);
  
  console.log('Interceptor executando para URL:', req.url);
  
  const token = authService.getToken();
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

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('Erro HTTP no interceptor:', error);
      
      if (error.status === 401) {
        console.log('Erro 401 - Não autorizado');
        authService.logout();
        router.navigate(['/login'], {
          queryParams: { 
            error: 'Sessão expirada. Por favor, faça login novamente.'
          }
        });
      } else if (error.status === 403) {
        console.log('Erro 403 - Acesso negado');
        snackBar.open('Acesso negado. Você não tem permissão para realizar esta ação.', 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
      
      return throwError(() => error);
    })
  );
};