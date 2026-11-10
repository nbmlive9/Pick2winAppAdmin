import { Component } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';
@Component({ selector: 'app-profile', templateUrl: './profile.component.html' })
export class ProfileComponent {
  readonly profile$ = this.admin.profile$;
  constructor(private admin: AdminService) {}
}
