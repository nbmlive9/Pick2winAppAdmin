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

  getRgOverview(): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    return this.http.get(`${this.Base_URL}/getrgoverview`, { headers });
  }

  getHighRiskUsers(page = 1, limit = 20): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get(`${this.Base_URL}/gethighriskusers`, {
      headers,
      params,
    });
  }

  getDepositLimits(
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
    return this.http.get(`${this.Base_URL}/getdepositlimits`, {
      headers,
      params,
    });
  }

  getLimitChanges(page = 1, limit = 20): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get(`${this.Base_URL}/getlimitchanges`, { headers, params });
  }

  getMonthlyLossUsers(page = 1, limit = 20): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get(`${this.Base_URL}/getmonthlylossusers`, { headers, params });
  }

  getSelfExclusions(page = 1, limit = 20, filter = '', search = ''): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('filter', filter)
      .set('search', search);
    return this.http.get(`${this.Base_URL}/getselfexclusions`, { headers, params });
  }

  getRgAlerts(page = 1, limit = 20): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get(`${this.Base_URL}/getrgalerts`, { headers, params });
  }

  private complianceGet(path: string, params: HttpParams): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    return this.http.get(`${this.Base_URL}/${path}`, { headers, params });
  }

  getComplianceOverview(page = 1, limit = 20): Observable<any> {
    return this.complianceGet('getcomplianceoverview', new HttpParams().set('page', page).set('limit', limit));
  }

  getCases(page = 1, limit = 20): Observable<any> {
    return this.complianceGet('getcases', new HttpParams().set('page', page).set('limit', limit));
  }

  getCaseById(caseId: string | number): Observable<any> {
    return this.complianceGet(`getcasebyid/${encodeURIComponent(String(caseId))}`, new HttpParams());
  }

  getKyc0(page = 1, limit = 20, filter = '', search = ''): Observable<any> {
    const params = new HttpParams().set('page', page).set('limit', limit).set('filter', filter).set('search', search);
    return this.complianceGet('getkyc0', params);
  }

  getKyc1(page = 1, limit = 20, filter = '', search = ''): Observable<any> {
    const params = new HttpParams().set('page', page).set('limit', limit).set('filter', filter).set('search', search);
    return this.complianceGet('getkyc1', params);
  }

  getAml(page = 1, limit = 20, status = ''): Observable<any> {
    const params = new HttpParams().set('page', page).set('limit', limit).set('status', status);
    return this.complianceGet('getaml', params);
  }

  getSof(page = 1, limit = 20): Observable<any> {
    return this.complianceGet('getsof', new HttpParams().set('page', page).set('limit', limit));
  }

  getSofCandidates(page = 1, limit = 20): Observable<any> {
    return this.complianceGet('getsofcandidates', new HttpParams().set('page', page).set('limit', limit));
  }

  getPep(page = 1, limit = 20): Observable<any> {
    return this.complianceGet('getpep', new HttpParams().set('page', page).set('limit', limit));
  }

  getSuspicious(page = 1, limit = 20): Observable<any> {
    return this.complianceGet('getsuspicious', new HttpParams().set('page', page).set('limit', limit));
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

  getConsentLogs(page = 1, limit = 20): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get(`${this.Base_URL}/getconsentlogs`, {
      headers,
      params,
    });
  }

  getUserProfile(userId: string | number): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    return this.http.get(
      `${this.Base_URL}/getuserprofile/${encodeURIComponent(String(userId))}`,
      { headers },
    );
  }

  getUserNotes(userId: string | number, page = 1, limit = 20): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get(
      `${this.Base_URL}/getusernotes/${encodeURIComponent(String(userId))}`,
      { headers, params },
    );
  }

  getDeletedAccounts(page = 1, limit = 20): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get(`${this.Base_URL}/getdeletedaccounts`, {
      headers,
      params,
    });
  }
}
