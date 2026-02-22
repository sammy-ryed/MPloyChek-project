// modules/auth/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  loading      = false;
  errorMsg     = '';
  hidePassword = true;
  apiDelayMs   = 0;   // simulate async delay on login request

  readonly roles = ['General User', 'Admin'];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.auth.isLoggedIn) {
      this.router.navigate(['/dashboard']);
    }

    this.loginForm = this.fb.group({
      userId:   ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role:     ['General User', Validators.required],
      apiDelay: [0, [Validators.min(0), Validators.max(10000)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }

    this.loading  = true;
    this.errorMsg = '';
    this.apiDelayMs = this.loginForm.value.apiDelay ?? 0;

    // Append ?delay to showcase async processing
    const delay$ = this.apiDelayMs > 0
      ? new Promise<void>(r => setTimeout(r, 0))   // UI turn
      : Promise.resolve();

    delay$.then(() => {
      const { userId, password } = this.loginForm.value;

      // Build the URL with delay param via service (auth API call)
      this.auth.login({ userId, password }).pipe(
        finalize(() => (this.loading = false))
      ).subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: err => {
          this.errorMsg = err?.error?.message ?? 'Login failed. Please try again.';
        }
      });
    });
  }

  field(name: string) { return this.loginForm.get(name); }

  // Quick-fill demo credentials
  fillDemo(type: 'admin' | 'user'): void {
    const creds = type === 'admin'
      ? { userId: 'admin',  role: 'Admin'        }
      : { userId: 'jdoe',   role: 'General User' };
    this.loginForm.patchValue({ ...creds, password: 'password123' });
  }
}
