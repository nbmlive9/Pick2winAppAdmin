import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ADMIN_ROLES, AdminRole, AdminUser, LoginRequest, LoginResponse } from '../models/auth.models';
import { TokenService } from './token.service';
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSubject = new BehaviorSubject<AdminUser | null>(null);
  readonly user$ = this.userSubject.asObservable();
  private expiryTimer?: ReturnType<typeof setTimeout>;
  constructor(private http: HttpClient, private tokens: TokenService) {}
  login(credentials: LoginRequest): Observable<AdminUser> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/admin/login`, credentials).pipe(
      timeout(30000),
      map(response => {
        const claims = typeof response?.token === 'string' ? this.tokens.claims(response.token) : null;
        const user = response?.data;
        if (!response?.success || !claims || !user || user.status !== 'active'
          || !ADMIN_ROLES.includes(user.role) || claims.role !== user.role
          || typeof user.id !== 'number' || typeof user.name !== 'string' || typeof user.email !== 'string') {
          throw new Error('This account cannot access the admin portal.');
        }
        this.clearSession();
        this.tokens.set(response.token);
        const account: AdminUser = { id: user.id, name: user.name, email: user.email,
          role: user.role, status: user.status, last_login_at: user.last_login_at, created_at: user.created_at };
        this.expiryTimer = setTimeout(() => this.clearSession(), Math.min(claims.exp * 1000 - Date.now(), 2147483647));
        return account;
      }), tap(user => this.userSubject.next(user))
    );
  }
  get currentUser(): AdminUser | null {
    if (!this.tokens.get()) { this.clearSession(); return null; }
    return this.userSubject.value;
  }
  hasRole(roles: readonly AdminRole[]): boolean {
    const user = this.currentUser;
    return !!user && roles.includes(user.role);
  }
  clearSession(): void {
    clearTimeout(this.expiryTimer);
    this.tokens.clear();
    this.userSubject.next(null);
  }
}
