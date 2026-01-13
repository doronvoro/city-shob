import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginFormComponent } from './login-form.component';

describe('LoginFormComponent', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;
  let fb: FormBuilder;

  beforeEach(async () => {
    fb = new FormBuilder();

    await TestBed.configureTestingModule({
      imports: [LoginFormComponent, NoopAnimationsModule, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;

    component.loginForm = fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    component.registerForm = fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit login event when form is valid', () => {
    spyOn(component.login, 'emit');
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });
    component.onLogin();
    expect(component.login.emit).toHaveBeenCalled();
  });

  it('should not emit login event when form is invalid', () => {
    spyOn(component.login, 'emit');
    component.onLogin();
    expect(component.login.emit).not.toHaveBeenCalled();
  });

  it('should emit toggleMode event', () => {
    spyOn(component.toggleMode, 'emit');
    component.onToggleMode();
    expect(component.toggleMode.emit).toHaveBeenCalled();
  });
});
