// src/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Material Modules que serão compartilhados
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Componentes compartilhados
import { HeaderComponent } from './components/header/header.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';

@NgModule({
  declarations: [
    // Components, Directives, Pipes que pertencem a este módulo
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    
    // Material Modules compartilhados
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    
    // Componentes standalone importados
    HeaderComponent,
    ConfirmDialogComponent
  ],
  exports: [
    // Exporta módulos que outros módulos precisam
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    
    // Material Modules
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    
    // Componentes
    HeaderComponent,
    ConfirmDialogComponent
  ]
})
export class SharedModule { }