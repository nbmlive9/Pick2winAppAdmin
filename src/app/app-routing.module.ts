import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';
import { ADMIN_ROLES } from './core/models/auth.models';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'admin/dashboard' },
  { path: 'login', canActivate: [GuestGuard], loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  { path: 'admin', canMatch: [AuthGuard], canActivate: [AuthGuard], data: { roles: ADMIN_ROLES }, loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },
  { path: 'forbidden', loadChildren: () => import('./auth/forbidden.module').then(m => m.ForbiddenModule) },
  { path: '**', redirectTo: 'admin/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
