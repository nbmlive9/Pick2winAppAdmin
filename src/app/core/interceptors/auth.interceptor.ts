import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private tokens: TokenService, private auth: AuthService, private router: Router) {}
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const target = new URL(request.url, window.location.origin);
    const api = new URL(environment.apiUrl);
    const isApi = target.origin === api.origin && target.pathname.startsWith(api.pathname + '/');
    const isLogin = target.pathname === api.pathname + '/auth/admin/login';
    const token = this.tokens.get();
    const authenticated = isApi && !isLogin && !!token;
    const outgoing = authenticated ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;
    return next.handle(outgoing).pipe(catchError((error: unknown) => {
      if (authenticated && error instanceof HttpErrorResponse && token === this.tokens.get()) {
        if (error.status === 401) {
          this.auth.clearSession();
          void this.router.navigate(['/login'], { queryParams: { reason: 'expired' } });
        } else if (error.status === 403) void this.router.navigate(['/forbidden']);
      }
      return throwError(() => error);
    }));
  }
}
