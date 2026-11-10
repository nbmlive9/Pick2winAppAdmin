import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  it('redirects guests and blocks roles outside the route allowlist', () => {
    const session = { currentUser: null as object | null, hasRole: () => false };
    TestBed.configureTestingModule({ imports: [RouterTestingModule], providers: [{ provide: AuthService, useValue: session }] });
    const guard = TestBed.inject(AuthGuard);
    const router = TestBed.inject(Router);
    const result = guard.canMatch({ data: { roles: ['super_admin'] } }, []);
    expect(router.serializeUrl(result as import('@angular/router').UrlTree)).toContain('/login');
    session.currentUser = { role: 'admin' };
    const denied = guard.canMatch({ data: { roles: ['super_admin'] } }, []);
    expect(router.serializeUrl(denied as import('@angular/router').UrlTree)).toBe('/forbidden');
    session.hasRole = () => true;
    expect(guard.canMatch({ data: { roles: ['admin'] } }, [])).toBeTrue();
  });
});
