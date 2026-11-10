import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
@Component({ selector: 'app-admin-layout', templateUrl: './admin-layout.component.html' })
export class AdminLayoutComponent implements OnDestroy {
  private readonly session: Subscription;
  constructor(public auth: AuthService, router: Router) {
    this.session = auth.user$.subscribe(user => {
      if (!user) void router.navigate(['/login'], { queryParams: { reason: 'expired' } });
    });
  }
  ngOnDestroy(): void { this.session.unsubscribe(); }
}
