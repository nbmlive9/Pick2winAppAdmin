import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanMatch, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AdminRole } from '../models/auth.models';
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild, CanMatch {
  constructor(private auth: AuthService, private router: Router) {}
  private check(roles: AdminRole[] | undefined, url: string): boolean | UrlTree {
    if (!this.auth.currentUser) return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: url } });
    return !roles || this.auth.hasRole(roles) ? true : this.router.createUrlTree(['/forbidden']);
  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    return this.check(route.data['roles'], state.url);
  }
  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    return this.canActivate(route, state);
  }
  canMatch(route: Route, segments: UrlSegment[]): boolean | UrlTree {
    return this.check(route.data?.['roles'], '/' + segments.map(s => s.path).join('/'));
  }
}
