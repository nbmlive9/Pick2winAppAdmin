import { Injectable } from '@angular/core';
import { JwtClaims } from '../models/auth.models';
@Injectable({ providedIn: 'root' })
export class TokenService {
  private token: string | null = null;
  set(token: string): void { this.token = token; }
  clear(): void { this.token = null; }
  get(): string | null { return this.token && this.claims(this.token) ? this.token : null; }
  // Decoding supports navigation only. The backend must verify JWT signatures.
  claims(token: string): JwtClaims | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const claims = JSON.parse(atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, '='))) as JwtClaims;
      return typeof claims.exp === 'number' && Number.isFinite(claims.exp)
        && claims.exp * 1000 > Date.now() && typeof claims.role === 'string' ? claims : null;
    } catch { return null; }
  }
}
