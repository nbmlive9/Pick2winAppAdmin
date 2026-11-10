import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
@NgModule({ declarations: [AdminLayoutComponent, DashboardComponent, ProfileComponent], imports: [CommonModule, AdminRoutingModule] })
export class AdminModule {}
