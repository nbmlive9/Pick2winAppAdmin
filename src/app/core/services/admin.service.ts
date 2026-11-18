import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class AdminService {
  // Add API-backed profile and dashboard operations when endpoint contracts are available.
  readonly profile$ = this.auth.user$;
  private Base_URL = 'https://adminapp-clc9.onrender.com/api/adminpop';

  constructor(
    private auth: AuthService,
    private http: HttpClient,
    private tokens: TokenService,
  ) {}

  getDashboardHome(): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    return this.http.get(`${this.Base_URL}/getdashboard`, { headers });
  }

  getStudentUsers(page = 1, limit = 20, filter = ''): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('filter', filter);
    return this.http.get(`${this.Base_URL}/getstudentusers`, { headers, params });
  }

  getSubscriptionUsers(
    page = 1,
    limit = 20,
    filter = '',
    search = '',
  ): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('filter', filter)
      .set('search', search);
    return this.http.get(`${this.Base_URL}/getsubscriptionusers`, {
      headers,
      params,
    });
  }
}
