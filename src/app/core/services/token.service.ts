import { Injectable } from '@angular/core';
import { JwtClaims } from '../models/auth.models';
@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly storageKey = 'pick2win.admin.token';
  private token: string | null = this.readStoredToken();
  set(token: string): void {
    this.token = token;
    try {
      sessionStorage.setItem(this.storageKey, token);
    } catch {
      // Keep the in-memory session if browser storage is unavailable.
    }
  }
  clear(): void {
    this.token = null;
    try {
      sessionStorage.removeItem(this.storageKey);
    } catch {
      // The in-memory session is still cleared when browser storage is unavailable.
    }
  }
  get(): string | null {
    return this.token && this.claims(this.token) ? this.token : null;
  }
  // Decoding supports navigation only. The backend must verify JWT signatures.
  private readStoredToken(): string | null {
    try {
      const token = sessionStorage.getItem(this.storageKey);
      return token && this.claims(token) ? token : null;
    } catch {
      return null;
    }
  }
  claims(token: string): JwtClaims | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const claims = JSON.parse(
        atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, '=')),
      ) as JwtClaims;
      return typeof claims.exp === 'number' &&
        Number.isFinite(claims.exp) &&
        claims.exp * 1000 > Date.now() &&
        typeof claims.role === 'string'
        ? claims
        : null;
    } catch {
      return null;
    }
  }
}
