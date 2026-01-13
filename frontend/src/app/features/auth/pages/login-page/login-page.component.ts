import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LoginFormComponent, ServerError } from '../../components/login-form/login-form.component';
import { AuthService } from '../../../../core/services/auth.service';
import { SNACKBAR_DURATION } from '../../../../core/constants';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, LoginFormComponent, MatSnackBarModule],
  template: `
    <app-login-form
      [loginForm]="loginForm"
      [registerForm]="registerForm"
      [isLoginMode]="isLoginMode"
      [isLoading]="isLoading"
      [serverError]="serverError"
      (login)="onLogin()"
      (register)="onRegister()"
      (toggleMode)="onToggleMode()"
      (clearError)="onClearError()"
    />
  `
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  isLoginMode = true;
  isLoading = false;
  serverError: ServerError | undefined = undefined;

  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator.bind(this) });
  }

  private passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onToggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.serverError = undefined;
  }

  onClearError(): void {
    this.serverError = undefined;
  }

  onLogin(): void {
    this.isLoading = true;
    this.serverError = undefined;
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: () => {
        this.snackBar.open('Login successful', 'Close', { duration: SNACKBAR_DURATION.SHORT });
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        this.serverError = {
          message: error.error?.message || 'Login failed. Please check your credentials.',
          errors: error.error?.errors
        };
      }
    });
  }

  onRegister(): void {
    this.isLoading = true;
    this.serverError = undefined;
    const { email, password } = this.registerForm.value;
    this.authService.register(email, password).subscribe({
      next: () => {
        this.snackBar.open('Registration successful', 'Close', { duration: SNACKBAR_DURATION.SHORT });
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        this.serverError = {
          message: error.error?.message || 'Registration failed. Please try again.',
          errors: error.error?.errors
        };
      }
    });
  }
}
