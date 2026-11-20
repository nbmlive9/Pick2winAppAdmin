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

  /* ================================================================
   * PRIVATE HELPERS
   * ================================================================ */

  private complianceGet(path: string, params: HttpParams): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    return this.http.get(`${this.Base_URL}/${path}`, { headers, params });
  }

  private compliancePost(path: string, body: unknown): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    return this.http.post(`${this.Base_URL}/${path}`, body, { headers });
  }

  private compliancePut(path: string, body: unknown): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    return this.http.put(`${this.Base_URL}/${path}`, body, { headers });
  }

  /* ================================================================
   * DASHBOARD / HOME SCREEN
   * ================================================================ */

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

  getOperatorWallet(): Observable<any> {
    return this.complianceGet('getoperatorwallet', new HttpParams());
  }

  getBonusOverview(): Observable<any> {
    return this.complianceGet('getbonusoverview', new HttpParams());
  }

  getSubscriptionOverview(page = 1, limit = 20, filter = 'expiring'): Observable<any> {
    return this.complianceGet('getsubscriptionoverview', new HttpParams()
      .set('page', page).set('limit', limit).set('filter', filter));
  }

  getSeriesOverview(page = 1, limit = 20, status = '', search = ''): Observable<any> {
    return this.complianceGet('getseriesoverview', new HttpParams()
      .set('page', page).set('limit', limit).set('status', status).set('search', search));
  }

  getMatchesOverview(page = 1, limit = 20, when = '', seriesId = '', search = ''): Observable<any> {
    return this.complianceGet('getmatchesoverview', new HttpParams()
      .set('page', page).set('limit', limit).set('when', when).set('series_id', seriesId).set('search', search));
  }

  getAuditOverview(page = 1, limit = 20): Observable<any> {
    return this.complianceGet('getauditoverview', new HttpParams().set('page', page).set('limit', limit));
  }

  getComplianceOverview(page = 1, limit = 20): Observable<any> {
    return this.complianceGet(
      'getcomplianceoverview',
      new HttpParams().set('page', page).set('limit', limit),
    );
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

  getMonthlyLossUsers(page = 1, limit = 20): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get(`${this.Base_URL}/getmonthlylossusers`, {
      headers,
      params,
    });
  }

  /* ================================================================
   * TRANSACTIONS SCREEN
   * ================================================================ */

  getDeposits(
    page = 1,
    limit = 20,
    status = '',
    from = '',
    to = '',
    minAmount = '',
    search = '',
  ): Observable<any> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('status', status)
      .set('from', from)
      .set('to', to)
      .set('min_amount', minAmount)
      .set('search', search);
    return this.complianceGet('getdeposits', params);
  }

  getTransactions(page = 1, limit = 20): Observable<any> {
    return this.complianceGet(
      'gettransactions',
      new HttpParams().set('page', page).set('limit', limit),
    );
  }

  /* ================================================================
   * USER FUNDS SCREEN
   * ================================================================ */

  getBonusTransactions(
    page = 1,
    limit = 20,
    type = '',
    transtype = '',
  ): Observable<any> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('type', type)
      .set('transtype', transtype);
    return this.complianceGet('getbonustransactions', params);
  }

  getUserFunds(
    page = 1,
    limit = 20,
    filter = '',
    minBalance = 1000,
    search = '',
  ): Observable<any> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('filter', filter)
      .set('min_balance', minBalance)
      .set('search', search);
    return this.complianceGet('getuserfunds', params);
  }

  getInactiveFunds(page = 1, limit = 20, months = 12): Observable<any> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('months', months);
    return this.complianceGet('getinactivefunds', params);
  }

  sendInactiveReminders(userIds: Array<string | number>, message: string): Observable<any> {
    return this.compliancePost('sendinactivereminders', { user_ids: userIds, message });
  }

  /* ================================================================
   * WITHDRAWALS SCREEN
   * ================================================================ */

  getWithdrawalQueue(page = 1, limit = 20): Observable<any> {
    return this.complianceGet(
      'getwithdrawalqueue',
      new HttpParams().set('page', page).set('limit', limit),
    );
  }

  getWithdrawalReview(withdrawId: string): Observable<any> {
    return this.complianceGet(`getwithdrawalreview/${encodeURIComponent(withdrawId)}`, new HttpParams());
  }

  holdWithdrawal(withdrawId: string, note: string): Observable<any> {
    return this.compliancePost(`holdwithdrawal/${encodeURIComponent(withdrawId)}`, { note });
  }

  releaseWithdrawal(withdrawId: string, note: string): Observable<any> {
    return this.compliancePost(`releasewithdrawal/${encodeURIComponent(withdrawId)}`, { note });
  }

  addWithdrawalNote(withdrawId: string, note: string): Observable<any> {
    return this.compliancePost(`addwithdrawalnote/${encodeURIComponent(withdrawId)}`, { note });
  }

  requestWithdrawalVerification(withdrawId: string, message: string): Observable<any> {
    return this.compliancePost(`requestwithdrawalverification/${encodeURIComponent(withdrawId)}`, { message });
  }

  /* ================================================================
   * USER MANAGEMENT SCREEN
   * ================================================================ */

  getStudentUsers(page = 1, limit = 20, filter = ''): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('filter', filter);
    return this.http.get(`${this.Base_URL}/getstudentusers`, {
      headers,
      params,
    });
  }

  /* ================================================================
   * KYC / AML / COMPLIANCE SCREEN
   * ================================================================ */

  getKyc0(page = 1, limit = 20, filter = '', search = ''): Observable<any> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('filter', filter)
      .set('search', search);
    return this.complianceGet('getkyc0', params);
  }

  getKyc1(page = 1, limit = 20, filter = '', search = ''): Observable<any> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('filter', filter)
      .set('search', search);
    return this.complianceGet('getkyc1', params);
  }

  getAml(page = 1, limit = 20, status = ''): Observable<any> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('status', status);
    return this.complianceGet('getaml', params);
  }

  getSof(page = 1, limit = 20): Observable<any> {
    return this.complianceGet(
      'getsof',
      new HttpParams().set('page', page).set('limit', limit),
    );
  }

  getSofCandidates(page = 1, limit = 20): Observable<any> {
    return this.complianceGet(
      'getsofcandidates',
      new HttpParams().set('page', page).set('limit', limit),
    );
  }

  getPep(page = 1, limit = 20): Observable<any> {
    return this.complianceGet(
      'getpep',
      new HttpParams().set('page', page).set('limit', limit),
    );
  }

  getSuspicious(page = 1, limit = 20): Observable<any> {
    return this.complianceGet(
      'getsuspicious',
      new HttpParams().set('page', page).set('limit', limit),
    );
  }

  updateKyc1(userId: string | number, payload: { kyc_status: string; reason: string }): Observable<any> {
    return this.compliancePut(`updatekyc1/${encodeURIComponent(String(userId))}`, payload);
  }

  chaseOverdueSof(days: number): Observable<any> {
    return this.compliancePost('chaseoverduesof', { days });
  }

  updateSof(userId: string | number, payload: { verified: boolean; reason: string }): Observable<any> {
    return this.compliancePut(`updatesof/${encodeURIComponent(String(userId))}`, payload);
  }

  /* ================================================================
   * CASES SCREEN
   * ================================================================ */

  getCases(page = 1, limit = 20): Observable<any> {
    return this.complianceGet(
      'getcases',
      new HttpParams().set('page', page).set('limit', limit),
    );
  }

  getCaseById(caseId: string | number): Observable<any> {
    return this.complianceGet(
      `getcasebyid/${encodeURIComponent(String(caseId))}`,
      new HttpParams(),
    );
  }

  createCase(payload: {
    user_id: string | number;
    case_type: string;
    title: string;
    trigger_text: string;
    risk_score: number;
    amount: number;
    note: string;
  }): Observable<any> {
    return this.compliancePost('createcase', payload);
  }

  updateCase(caseId: string | number, payload: {
    status: string;
    assigned_to: string | number;
    note: string;
  }): Observable<any> {
    return this.compliancePut(`updatecase/${encodeURIComponent(String(caseId))}`, payload);
  }

  addCaseNote(caseId: string | number, note: string): Observable<any> {
    return this.compliancePost(`addcasenote/${encodeURIComponent(String(caseId))}`, { note });
  }

  caseAction(caseId: string | number, payload: Record<string, unknown>): Observable<any> {
    return this.compliancePost(`caseaction/${encodeURIComponent(String(caseId))}`, payload);
  }

  /* ================================================================
   * MATCH / CONTESTS SCREEN
   * ================================================================ */

  getMatchContests(matchId: string | number): Observable<any> {
    return this.complianceGet(`getmatchcontests/${encodeURIComponent(String(matchId))}`, new HttpParams());
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

  addUserNote(userId: string | number, note: string): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    return this.http.post(
      `${this.Base_URL}/addusernote/${encodeURIComponent(String(userId))}`,
      { note },
      { headers },
    );
  }

  suspendUser(userId: string | number, reason: string): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    return this.http.post(
      `${this.Base_URL}/suspenduser/${encodeURIComponent(String(userId))}`,
      { reason },
      { headers },
    );
  }

  unsuspendUser(userId: string | number, reason: string): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    return this.http.post(
      `${this.Base_URL}/unsuspenduser/${encodeURIComponent(String(userId))}`,
      { reason },
      { headers },
    );
  }

  deleteUser(userId: string | number, reason: string): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    return this.http.post(
      `${this.Base_URL}/deleteuser/${encodeURIComponent(String(userId))}`,
      { reason },
      { headers },
    );
  }

  markAccountErased(userId: string | number, note: string): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    return this.http.post(
      `${this.Base_URL}/markaccounterased/${encodeURIComponent(String(userId))}`,
      { note },
      { headers },
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

  /* ================================================================
   * DEPOSITS & LIMITS SCREEN
   * ================================================================ */

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
    return this.http.get(`${this.Base_URL}/getlimitchanges`, {
      headers,
      params,
    });
  }

  updateDepositLimit(
    userId: string | number,
    depositLimit: number,
    reason: string,
  ): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    return this.http.put(
      `${this.Base_URL}/updatedepositlimit/${encodeURIComponent(String(userId))}`,
      { deposit_limit: depositLimit, reason },
      { headers },
    );
  }

  applyDueLimitChanges(): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    return this.http.request(
      'POST',
      `${this.Base_URL}/applyduelimitchanges`,
      { headers },
    );
  }

  applyLimitChange(
    limitRequestId: string | number,
    reason: string,
    force: boolean,
  ): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    return this.http.post(
      `${this.Base_URL}/applylimitchange/${encodeURIComponent(String(limitRequestId))}`,
      { reason, force },
      { headers },
    );
  }

  rejectLimitChange(
    limitRequestId: string | number,
    reason: string,
  ): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    return this.http.post(
      `${this.Base_URL}/rejectlimitchange/${encodeURIComponent(String(limitRequestId))}`,
      { reason },
      { headers },
    );
  }

  /* ================================================================
   * RESPONSIBLE GAMING (RG) SCREEN
   * ================================================================ */

  getSelfExclusions(
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
    return this.http.get(`${this.Base_URL}/getselfexclusions`, {
      headers,
      params,
    });
  }

  getRgAlerts(page = 1, limit = 20): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    const params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get(`${this.Base_URL}/getrgalerts`, { headers, params });
  }

  createIntervention(payload: {
    user_id: string | number;
    channel: string;
    title: string;
    message: string;
  }): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    return this.http.post(
      `${this.Base_URL}/createintervention`,
      payload,
      { headers },
    );
  }

  createBulkIntervention(payload: {
    user_ids: Array<string | number>;
    channel: string;
    title: string;
    message: string;
  }): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    return this.http.post(
      `${this.Base_URL}/createbulkintervention`,
      payload,
      { headers },
    );
  }

  createSelfExclusion(payload: {
    user_id: string | number;
    duration: string;
    gamstop_status: string;
    reason: string;
  }): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    return this.http.post(`${this.Base_URL}/createselfexclusion`, payload, { headers });
  }

  updateSelfExclusion(
    selfExclusionId: string | number,
    gamstopStatus: string,
    marketingBlocked: boolean,
  ): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    return this.http.put(
      `${this.Base_URL}/updateselfexclusion/${encodeURIComponent(String(selfExclusionId))}`,
      { gamstop_status: gamstopStatus, marketing_blocked: marketingBlocked },
      { headers },
    );
  }

  scanRgAlerts(): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    return this.http.request('POST', `${this.Base_URL}/scanrgalerts`, { headers });
  }

  markAllRgAlertsRead(): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    return this.http.request('POST', `${this.Base_URL}/markallrgalertsread`, { headers });
  }

  updateRgAlert(
    alertId: string | number,
    status: string,
    actionTaken: string,
  ): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    return this.http.put(
      `${this.Base_URL}/updatergalert/${encodeURIComponent(String(alertId))}`,
      { status, action_taken: actionTaken },
      { headers },
    );
  }

  createBulkAlertIntervention(payload: {
    alert_ids: Array<string | number>;
    title: string;
    message: string;
  }): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    return this.http.post(`${this.Base_URL}/createbulkintervention`, payload, { headers });
  }

  /* ================================================================
   * SUBSCRIPTION TRACKING SCREEN
   * ================================================================ */

  getSubscriptionTracking(page = 1, limit = 20, filter = '', search = ''): Observable<any> {
    return this.complianceGet('getsubscriptiontracking', new HttpParams()
      .set('page', page).set('limit', limit).set('filter', filter).set('search', search));
  }

  /* ================================================================
   * SUPPORT TICKETS SCREEN
   * ================================================================ */

  getSupportTickets(page = 1, limit = 20, filter = '', category = '', priority = '', search = ''): Observable<any> {
    return this.complianceGet('getsupporttickets', new HttpParams()
      .set('page', page).set('limit', limit).set('filter', filter).set('category', category)
      .set('priority', priority).set('search', search));
  }

  getSupportTicketById(ticketId: string | number): Observable<any> {
    return this.complianceGet(`getsupportticketbyid/${encodeURIComponent(String(ticketId))}`, new HttpParams());
  }

  createSupportTicket(payload: {
    user_id: string | number;
    category: string;
    subject: string;
    message: string;
    priority: string;
  }): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    return this.http.post(`${this.Base_URL}/createsupportticket`, payload, { headers });
  }

  replySupportTicket(ticketId: string | number, payload: { message: string }): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    return this.http.post(`${this.Base_URL}/replysupportticket/${encodeURIComponent(String(ticketId))}`, payload, { headers });
  }

  updateSupportTicket(ticketId: string | number, payload: { status: number; priority: string }): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    return this.http.put(`${this.Base_URL}/updatesupportticket/${encodeURIComponent(String(ticketId))}`, payload, { headers });
  }

  escalateSupportTicket(ticketId: string | number, payload: { note: string }): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    return this.http.post(`${this.Base_URL}/escalatesupportticket/${encodeURIComponent(String(ticketId))}`, payload, { headers });
  }

  /* ================================================================
   * NOTIFICATIONS SCREEN
   * ================================================================ */

  notifyUsers(payload: { user_ids: Array<string | number>; title: string; message: string }): Observable<any> {
    const token = this.tokens.get();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    return this.http.post(`${this.Base_URL}/notifyusers`, payload, { headers });
  }

  /* ================================================================
   * AUDIT & REPORTS SCREEN
   * ================================================================ */

  getAuditLogs(page = 1, limit = 20, category = '', adminId = '', from = '', to = '', search = ''): Observable<any> {
    return this.complianceGet('getauditlogs', new HttpParams()
      .set('page', page).set('limit', limit).set('category', category).set('admin_id', adminId)
      .set('from', from).set('to', to).set('search', search));
  }

  getReports(): Observable<any> {
    return this.complianceGet('getreports', new HttpParams());
  }

  getReport(reportKey: string, from?: string, to?: string): Observable<any> {
    let params = new HttpParams();
    // The supplied report contracts omit date parameters for these two keys.
    if (reportKey !== 'operator-pnl' && reportKey !== 'kyc-funnel') {
      params = params.set('from', from ?? '').set('to', to ?? '');
    }
    return this.complianceGet(`getreport/${encodeURIComponent(reportKey)}`, params);
  }
}
