import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, finalize, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
@Component({ selector: 'app-login', templateUrl: './login.component.html' })
export class LoginComponent implements OnDestroy {
  readonly form = this.fb.nonNullable.group({ email: ['', [Validators.required, Validators.email]], password: ['', Validators.required] });
  loading = false;
  error = '';
  readonly expired = this.route.snapshot.queryParamMap.get('reason') === 'expired';
  private readonly destroyed$ = new Subject<void>();
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private route: ActivatedRoute) {}
  submit(): void {
    if (this.loading) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';
    const values = this.form.getRawValue();
    this.auth.login({ email: values.email.trim(), password: values.password }).pipe(
      takeUntil(this.destroyed$), finalize(() => { this.loading = false; this.form.controls.password.reset(); })
    ).subscribe({
      next: () => {
        const requested = this.route.snapshot.queryParamMap.get('returnUrl') || '';
        const destination = /^\/admin(?:\/|$)/.test(requested) && !requested.includes('\\') ? requested : '/admin/dashboard';
        void this.router.navigateByUrl(destination);
      },
      error: (error: unknown) => {
        this.error = error instanceof HttpErrorResponse
          ? error.status === 401 ? 'Email or password is incorrect.'
          : error.status === 429 ? 'Too many attempts. Please try again later.'
          : error.status === 0 ? 'Cannot connect to the server. Please try again.'
          : 'Unable to sign in. Please try again.'
          : error instanceof Error && error.name !== 'TimeoutError' ? error.message : 'The request timed out. Please try again.';
      }
    });
  }
  ngOnDestroy(): void { this.destroyed$.next(); this.destroyed$.complete(); }
}
