// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { authInterceptor } from '../app/core/interceptors/auth.interceptor.functional'; // Mudar para functional

// Se você realmente precisa do NgRx (remova se não estiver usando)
// import { provideStore } from '@ngrx/store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor]) // Usar interceptor funcional
    ),
    provideAnimations()
    // Se estiver usando NgRx, descomente:
    // provideStore({})
  ]
};