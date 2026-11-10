import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';
import { ADMIN_ROLES } from '../core/models/auth.models';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
const routes: Routes = [{ path: '', component: AdminLayoutComponent, canActivateChild: [AuthGuard], children: [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: DashboardComponent, data: { roles: ADMIN_ROLES } },
  { path: 'profile', component: ProfileComponent, data: { roles: ADMIN_ROLES } }
]}];
@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class AdminRoutingModule {}
