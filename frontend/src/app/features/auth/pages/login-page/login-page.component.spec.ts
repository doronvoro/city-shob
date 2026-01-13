import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { LoginPageComponent } from './login-page.component';
import { AuthService } from '../../../../core/services/auth.service';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'register']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent, NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    })
    .overrideComponent(LoginPageComponent, {
      set: {
        providers: [{ provide: MatSnackBar, useValue: snackBarSpy }]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle mode', () => {
    expect(component.isLoginMode).toBeTrue();
    component.onToggleMode();
    expect(component.isLoginMode).toBeFalse();
  });

  it('should login successfully', () => {
    authServiceSpy.login.and.returnValue(of({ token: 'test', user: { id: '1', email: 'test@test.com' } }));
    component.loginForm.patchValue({ email: 'test@test.com', password: 'password' });
    component.onLogin();
    expect(authServiceSpy.login).toHaveBeenCalledWith('test@test.com', 'password');
  });

  it('should handle login error', fakeAsync(() => {
    authServiceSpy.login.and.returnValue(throwError(() => ({ error: { message: 'Invalid credentials' } })));
    component.loginForm.patchValue({ email: 'test@test.com', password: 'password' });
    component.onLogin();
    tick();
    expect(snackBarSpy.open).toHaveBeenCalled();
    flush();
  }));
});
