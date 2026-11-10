import { Component } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';
@Component({ selector: 'app-dashboard', templateUrl: './dashboard.component.html' })
export class DashboardComponent {
  readonly profile$ = this.admin.profile$;
  constructor(private admin: AdminService) {}
}
