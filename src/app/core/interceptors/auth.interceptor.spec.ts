import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthInterceptor } from './auth.interceptor';
import { TokenService } from '../services/token.service';
import { environment } from '../../../environments/environment';
describe('AuthInterceptor credential scope', () => {
  it('sends the bearer token only to protected API URLs', () => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }] });
    const http = TestBed.inject(HttpClient);
    const mock = TestBed.inject(HttpTestingController);
    const token = `header.${btoa(JSON.stringify({ role: 'admin', exp: Math.floor(Date.now() / 1000) + 600 }))}.signature`;
    TestBed.inject(TokenService).set(token);
    for (const url of [`${environment.apiUrl}/admin/profile`, `${environment.apiUrl}/auth/admin/login`,
      'https://example.com/api/admin/profile', `${environment.apiUrl}-other/profile`]) {
      http.get(url).subscribe();
      const request = mock.expectOne(url);
      expect(request.request.headers.get('Authorization')).toBe(url === `${environment.apiUrl}/admin/profile` ? `Bearer ${token}` : null);
      request.flush({});
    }
    mock.verify();
  });
});
