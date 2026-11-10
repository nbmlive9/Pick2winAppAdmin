import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { environment } from '../../../environments/environment';

describe('AuthService session validation', () => {
  let auth: AuthService;
  let http: HttpTestingController;
  let tokens: TokenService;
  const jwt = (role: string, exp = Math.floor(Date.now() / 1000) + 600) =>
    `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify({ role, exp }))}.signature`;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
    tokens = TestBed.inject(TokenService);
  });
  afterEach(() => { auth.clearSession(); http.verify(); });
  it('rejects malformed and expired tokens', () => {
    expect(tokens.claims('invalid')).toBeNull();
    expect(tokens.claims(jwt('admin', 1))).toBeNull();
  });
  it('accepts an active admin and enforces role checks', () => {
    auth.login({ email: 'test@example.com', password: 'test' }).subscribe();
    http.expectOne(`${environment.apiUrl}/auth/admin/login`).flush({ success: true, token: jwt('admin'),
      data: { id: 1, name: 'Test', email: 'test@example.com', role: 'admin', status: 'active' } });
    expect(auth.hasRole(['admin'])).toBeTrue();
    expect(auth.hasRole(['super_admin'])).toBeFalse();
    auth.clearSession();
    expect(tokens.get()).toBeNull();
    expect(auth.currentUser).toBeNull();
  });
  it('rejects mismatched token and response roles', () => {
    let rejected = false;
    auth.login({ email: 'test@example.com', password: 'test' }).subscribe({ error: () => rejected = true });
    http.expectOne(`${environment.apiUrl}/auth/admin/login`).flush({ success: true, token: jwt('admin'),
      data: { id: 1, name: 'Test', email: 'test@example.com', role: 'super_admin', status: 'active' } });
    expect(rejected).toBeTrue();
    expect(auth.currentUser).toBeNull();
  });
});
