import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

export type ValidationError = {
  field: string;
  message: string;
};

export type ServerError = {
  message: string;
  errors?: ValidationError[];
};

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  @Input({ required: true }) loginForm!: FormGroup;
  @Input({ required: true }) registerForm!: FormGroup;
  @Input() isLoginMode = true;
  @Input() isLoading = false;
  @Input() serverError: ServerError | undefined = undefined;

  @Output() login = new EventEmitter<void>();
  @Output() register = new EventEmitter<void>();
  @Output() toggleMode = new EventEmitter<void>();
  @Output() clearError = new EventEmitter<void>();

  onLogin = (): void => {
    if (this.loginForm.valid) {
      this.login.emit();
    }
  };

  onRegister = (): void => {
    if (this.registerForm.valid) {
      this.register.emit();
    }
  };

  onToggleMode = (): void => {
    this.clearError.emit();
    this.toggleMode.emit();
  };

  getFieldError = (fieldName: string): string | undefined => {
    if (!this.serverError?.errors) return undefined;
    const fieldError = this.serverError.errors.find(e => e.field === fieldName);
    return fieldError?.message;
  };

  dismissError = (): void => {
    this.clearError.emit();
  };
}
