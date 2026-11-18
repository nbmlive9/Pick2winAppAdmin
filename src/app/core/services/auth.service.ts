import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ADMIN_ROLES,
  AdminRole,
  AdminUser,
  LoginRequest,
  LoginResponse,
} from '../models/auth.models';
import { TokenService } from './token.service';
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userStorageKey = 'pick2win.admin.user';
  private readonly userSubject = new BehaviorSubject<AdminUser | null>(null);
  readonly user$ = this.userSubject.asObservable();
  private expiryTimer?: ReturnType<typeof setTimeout>;
  constructor(
    private http: HttpClient,
    private tokens: TokenService,
  ) {
    this.restoreSession();
  }
  login(credentials: LoginRequest): Observable<AdminUser> {
    return this.http
      .post<LoginResponse>(
        `${environment.apiUrl}/auth/admin/login`,
        credentials,
      )
      .pipe(
        map((response) => {
          const claims =
            typeof response?.token === 'string'
              ? this.tokens.claims(response.token)
              : null;
          const user = response?.data;
          if (
            !response?.success ||
            !claims ||
            !user ||
            user.status !== 'active' ||
            !ADMIN_ROLES.includes(user.role) ||
            claims.role !== user.role ||
            typeof user.id !== 'number' ||
            typeof user.name !== 'string' ||
            typeof user.email !== 'string'
          ) {
            throw new Error('This account cannot access the admin portal.');
          }

          this.clearSession();
          this.tokens.set(response.token);
          const account: AdminUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            last_login_at: user.last_login_at,
            created_at: user.created_at,
          };
          this.saveUser(account);
          // this.expiryTimer = setTimeout(
          //   () => this.clearSession(),
          //   Math.min(claims.exp * 1000 - Date.now(), 2147483647),
          // );
          return account;
        }),
        tap((user) => this.userSubject.next(user)),
      );
  }
  get currentUser(): AdminUser | null {
    if (!this.tokens.get()) {
      this.clearSession();
      return null;
    }
    return this.userSubject.value;
  }
  hasRole(roles: readonly AdminRole[]): boolean {
    const user = this.currentUser;
    return !!user && roles.includes(user.role);
  }
  clearSession(): void {
    clearTimeout(this.expiryTimer);
    this.tokens.clear();
    try {
      sessionStorage.removeItem(this.userStorageKey);
    } catch {
      // Continue clearing the in-memory session if storage is unavailable.
    }
    this.userSubject.next(null);
  }

  private restoreSession(): void {
    const token = this.tokens.get();
    if (!token) {
      this.clearSession();
      return;
    }
    try {
      const saved = sessionStorage.getItem(this.userStorageKey);
      const user = saved ? (JSON.parse(saved) as AdminUser) : null;
      if (
        user &&
        typeof user.id === 'number' &&
        typeof user.name === 'string' &&
        typeof user.email === 'string' &&
        ADMIN_ROLES.includes(user.role) &&
        user.status === 'active' &&
        this.tokens.claims(token)?.role === user.role
      ) {
        this.userSubject.next(user);
        return;
      }
    } catch {
      // Invalid or unavailable stored account data is treated as a signed-out session.
    }
    this.clearSession();
  }

  private saveUser(user: AdminUser): void {
    try {
      sessionStorage.setItem(this.userStorageKey, JSON.stringify(user));
    } catch {
      // Token persistence still allows the caller to continue for this page lifetime.
    }
  }
}
