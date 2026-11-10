import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
@Injectable({ providedIn: 'root' })
export class AdminService {
  // Add API-backed profile and dashboard operations when endpoint contracts are available.
  readonly profile$ = this.auth.user$;
  constructor(private auth: AuthService) {}
}
