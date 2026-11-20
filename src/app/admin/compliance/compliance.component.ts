import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AdminService } from 'src/app/core/services/admin.service';
import { getCompliancePage } from './compliance.data';
import { ComplianceCell, ComplianceMetric, CompliancePage, ComplianceRow, ComplianceTone } from './compliance.models';

@Component({
  selector: 'app-compliance',
  templateUrl: './compliance.component.html',
  styleUrls: ['./compliance.component.css'],
})
export class ComplianceComponent implements OnInit, OnDestroy {
  private routeData?: Subscription;
  private requestSequence = 0;
  private caseRequestSequence = 0;
  page: CompliancePage = getCompliancePage('cases');
  pageKey = 'cases';
  activeFilter = 'all';
  searchTerm = '';
  notice = '';
  loading = false;
  errorNotice = '';
  pagination: { total: number; page: number; limit: number; totalPages: number } | null = null;
  selectedCase: any = null;
  selectedCaseLoading = false;
  selectedCaseError = '';
  selectedCaseId: string | number | null = null;
  showCreateCaseForm = false;
  createCaseUserId = '';
  createCaseType = 'aml';
  createCaseTitle = 'Rapid deposits';
  createCaseTrigger = '3 deposits £2,400 in 18m';
  createCaseRiskScore = '88';
  createCaseAmount = '2400';
  createCaseNote = 'Opened from AML alert';
  caseMutationSubmitting = false;
  caseUpdateStatus = 'investigating';
  caseAssignedTo = '1';
  caseUpdateNote = 'Taking this one';
  caseNoteText = 'Requested bank statements';
  caseActionType = 'hold';
  selectedCaseForm: 'update' | 'note' | 'action' | null = null;
  caseActionNote = 'Pending review';
  caseActionMessage = 'Please upload 3 months of bank statements.';
  caseSarRef = 'SAR-2026-001';
  caseActionSubmitting = false;
  kyc1User: ComplianceRow | null = null;
  kyc1Status = 'approved';
  kyc1Reason = 'Documents verified manually';
  kyc1Submitting = false;
  showSofChaseForm = false;
  sofChaseDays = '14';
  sofChaseSubmitting = false;
  sofUser: ComplianceRow | null = null;
  sofVerified = true;
  sofReason = 'Payslips approved';
  sofSubmitting = false;

  constructor(private readonly route: ActivatedRoute, private readonly admin: AdminService) {}

  ngOnInit(): void {
    this.routeData = this.route.data.subscribe(data => {
      this.pageKey = data['view'] || 'cases';
      this.caseRequestSequence++;
      this.page = getCompliancePage(this.pageKey);
      this.activeFilter = 'all';
      this.searchTerm = '';
      this.notice = '';
      this.errorNotice = '';
      this.pagination = null;
      this.selectedCase = null;
      this.selectedCaseId = null;
      this.selectedCaseForm = null;
      this.showCreateCaseForm = false;
      this.kyc1User = null;
      this.showSofChaseForm = false;
      this.sofUser = null;
      this.loadCurrentView(1);
    });
  }

  get filteredRows(): ComplianceRow[] {
    const query = this.searchTerm.trim().toLowerCase();
    return this.page.rows.filter(row => {
      const filterMatch = this.activeFilter === 'all' || row.filters.includes(this.activeFilter);
      const queryMatch = !query || row.cells.some(cell =>
        `${cell.text} ${cell.id || ''}`.toLowerCase().includes(query));
      return filterMatch && queryMatch;
    });
  }

  setSearchTerm(value: string): void {
    this.searchTerm = value;
    if (this.pageKey === 'kyc0' || this.pageKey === 'kyc1') this.loadCurrentView(1);
  }

  setFilter(key: string): void {
    this.activeFilter = key;
    if (['kyc0', 'kyc1', 'aml'].includes(this.pageKey)) this.loadCurrentView(1);
  }

  private loadCurrentView(pageNumber: number): void {
    this.loading = true;
    this.errorNotice = '';
    const loadingPage = getCompliancePage(this.pageKey);
    this.page = {
      ...loadingPage,
      tableDescription: 'Loading records…',
      metrics: loadingPage.metrics.map(metric => ({ ...metric, value: '—', detail: 'Loading…', points: '' })),
      rows: [],
    };
    const sequence = ++this.requestSequence;
    const fail = (error: any) => {
      if (sequence !== this.requestSequence) return;
      this.loading = false;
      this.errorNotice = typeof error?.error?.message === 'string'
        ? error.error.message
        : error?.status === 0 ? 'The Compliance API could not be reached.' : `Could not load Compliance data (HTTP ${error?.status ?? 'error'}).`;
      this.page = {
        ...getCompliancePage(this.pageKey),
        subtitle: 'API data is unavailable.',
        metrics: getCompliancePage(this.pageKey).metrics.map(metric => ({ ...metric, value: '—', detail: 'Unavailable', points: '' })),
        rows: [],
      };
      this.pagination = null;
    };
    const applyRows = (response: any, rows: ComplianceRow[], metrics?: ComplianceMetric[], description?: string) => {
      if (sequence !== this.requestSequence) return;
      this.loading = false;
      this.page = {
        ...this.page,
        rows,
        ...(metrics ? { metrics } : {}),
        ...(description ? { tableDescription: description } : {}),
      };
      this.setPagination(response?.pagination, pageNumber);
    };
    const base = getCompliancePage(this.pageKey);

    if (this.pageKey === 'cases') {
      this.admin.getComplianceOverview(pageNumber, 20).subscribe({
        next: overview => {
          if (sequence !== this.requestSequence) return;
          this.admin.getCases(pageNumber, 20).subscribe({
            next: cases => {
              const kpis = overview?.kpis ?? {};
              const aml = kpis.aml_alerts ?? {};
              const pep = kpis.pep_sanctions ?? {};
              const metrics = [
                this.metricFromNumber('KYC0 Pending', kpis.kyc0_pending, 'Pending basic verification', '#5b8def'),
                this.metricFromNumber('KYC1 Pending', kpis.kyc1_pending, 'Pending identity verification', '#ffb627'),
                this.metricFromNumber('AML Alerts', aml.total, `${Number(aml.high) || 0} high · ${Number(aml.medium) || 0} medium · ${Number(aml.low) || 0} low`, '#ff3b47'),
                this.metricFromNumber('SoF Cases', kpis.sof_cases, 'Source-of-funds reviews', '#a78bfa'),
                this.metricFromNumber('PEP / Sanctions', Number(pep.total) || (Number(pep.pep) || 0) + (Number(pep.sanctions) || 0), `${Number(pep.pep) || 0} PEP · ${Number(pep.sanctions) || 0} sanctions`, '#2bd4a1'),
              ];
              const rows = Array.isArray(cases?.data) ? cases.data.map((item: any) => this.caseRow(item)) : [];
              const typeCounts = Array.isArray(overview?.open_by_type)
                ? overview.open_by_type.map((item: any) => `${item.type ?? item.case_type ?? item.label ?? 'Other'} ${Number(item.total ?? item.count ?? item.open) || 0}`).join(' · ')
                : '';
              const description = `${Number(cases?.pagination?.total) || 0} cases · ${Number(kpis.fraud) || 0} fraud flags${typeCounts ? ` · ${typeCounts}` : ''}`;
              applyRows(cases, rows, metrics, description);
            },
            error: fail,
          });
        },
        error: fail,
      });
      return;
    }

    const filter = this.activeFilter === 'all' ? '' : this.activeFilter;
    const requests: Record<string, any> = {
      kyc0: this.admin.getKyc0(pageNumber, 20, filter, this.searchTerm.trim()),
      kyc1: this.admin.getKyc1(pageNumber, 20, filter, this.searchTerm.trim()),
      aml: this.admin.getAml(pageNumber, 20, this.activeFilter === 'all' ? '' : filter),
      sof: this.admin.getSof(pageNumber, 20).pipe(
        switchMap(sof => this.admin.getSofCandidates(pageNumber, 20).pipe(map(candidates => ({
          ...sof,
          data: Array.isArray(candidates?.data) ? candidates.data : [],
          pagination: candidates?.pagination ?? sof?.pagination,
        })))),
      ),
      pep: this.admin.getPep(pageNumber, 20),
      suspicious: this.admin.getSuspicious(pageNumber, 20),
    };
    const request = requests[this.pageKey];
    if (!request) { this.loading = false; return; }
    request.subscribe({
      next: (response: any) => {
        if (sequence !== this.requestSequence) return;
        if (!Array.isArray(response?.data)) { fail({ error: { message: 'The response did not include a data array.' } }); return; }
        const summary = response.summary ?? {};
        let metrics = base.metrics;
        let rows: ComplianceRow[] = [];
        switch (this.pageKey) {
          case 'kyc0':
            metrics = [
              this.metricFromNumber('Pending KYC0', summary.pending, 'Awaiting basic verification', '#ffb627'),
              this.metricFromNumber('Passed', summary.passed, 'Basic checks passed', '#2bd4a1'),
              this.metricFromNumber('Registered Today · Pending', summary.registered_today_pending, 'New registrations awaiting checks', '#5b8def'),
              this.metricFromNumber('Pending Over 24h', summary.pending_over_24h, 'Older than the review target', '#ff3b47'),
            ];
            rows = response.data.map((item: any) => this.kyc0Row(item));
            break;
          case 'kyc1':
            metrics = [
              this.metricFromNumber('Pending KYC1', summary.pending, 'Identity checks awaiting review', '#ffb627'),
              this.metricFromNumber('Approved', summary.approved, 'Identity checks approved', '#2bd4a1'),
              this.metricFromNumber('Rejected', summary.rejected, 'Rejected checks', '#ff3b47'),
              this.metricFromNumber('Not Started', summary.not_started, 'Verification not started', '#5b8def'),
            ];
            rows = response.data.map((item: any) => this.kyc1Row(item));
            break;
          case 'aml':
            metrics = [
              this.metricFromNumber('High-Risk Users', summary.high_risk_users, 'AML risk monitoring', '#ff3b47'),
              this.metricFromNumber('Open Cases', summary.open_cases, `${Number(summary.pending_mlro) || 0} pending MLRO review`, '#ffb627'),
              this.metricFromNumber('SARs Filed (30d)', summary.sars_filed_30d, 'Suspicious activity reports', '#a78bfa'),
              this.metricFromNumber('Avg Case Age', `${Number(summary.avg_case_age_days) || 0}d`, 'Average open-case age', '#2bd4a1'),
            ];
            rows = response.data.map((item: any) => this.amlRow(item));
            break;
          case 'sof':
            metrics = [
              this.metricFromNumber('SoF Requests Open', summary.open_requests, `${Number(summary.avg_days_open) || 0} average days open`, '#ffb627'),
              this.metricFromNumber('Pending > 30 days', summary.pending_over_30d, 'Long-running requests', '#ff3b47'),
              this.metricFromNumber('Cleared (30d)', summary.cleared_30d, 'Requests cleared in the last 30 days', '#2bd4a1'),
              this.metricFromNumber('Total Funds Reviewed', this.currency(summary.total_funds_reviewed), `Threshold ${this.currency(summary.threshold)}`, '#5b8def'),
            ];
            rows = response.data.map((item: any) => this.sofRow(item));
            break;
          case 'sofCandidates':
            metrics = base.metrics.map((item, index) => index === 0
              ? this.metricFromNumber('SoF Candidates', response.pagination?.total ?? response.data.length, 'Users identified for source-of-funds review', '#ffb627')
              : { ...item, value: '—', detail: 'Not provided by this endpoint', points: '' });
            rows = response.data.map((item: any) => this.sofCandidateRow(item));
            break;
          case 'pep':
            metrics = [
              this.metricFromNumber('PEP Users', summary.pep_users, 'Politically exposed persons', '#ffb627'),
              this.metricFromNumber('Sanctions Matches', summary.sanctions_matches, 'Potential sanctions matches', '#ff3b47'),
              this.metricFromNumber('Last Screening', summary.last_screening_at ? this.formatDate(summary.last_screening_at) : '—', 'Latest screening run', '#2bd4a1'),
              this.metricFromNumber('False Positives (30d)', summary.false_positives_30d, 'Cleared after review', '#5b8def'),
            ];
            rows = response.data.map((item: any) => this.pepRow(item));
            break;
          case 'suspicious':
            metrics = [
              this.metricFromNumber('Open Suspicious Flags', summary.open_flags, `${Number(summary.pending_mlro) || 0} pending MLRO decision`, '#ff3b47'),
              this.metricFromNumber('SARs Filed (YTD)', summary.sars_filed_ytd, `${Number(summary.sars_filed_30d) || 0} in last 30 days`, '#ffb627'),
              this.metricFromNumber('Tipping-Off Risk', summary.tipping_off_risk, 'Active investigations with communication restrictions', '#ff3b47'),
              this.metricFromNumber('Resolved (30d)', summary.resolved_30d, 'Flags resolved in the last 30 days', '#2bd4a1'),
            ];
            rows = response.data.map((item: any) => this.suspiciousRow(item));
            break;
        }
        applyRows(response, rows, metrics);
      },
      error: fail,
    });
  }

  private metricFromNumber(label: string, value: any, detail: string, color: string): ComplianceMetric {
    const display = typeof value === 'string' && !Number.isFinite(Number(value))
      ? value
      : new Intl.NumberFormat('en-GB').format(Number(value) || 0);
    return { label, value: display, detail, color, points: `${0},28 ${100},28` };
  }

  private setPagination(paging: any, requestedPage: number): void {
    if (!paging) { this.pagination = null; return; }
    this.pagination = {
      total: Number(paging.total) || 0,
      page: Number(paging.page) || requestedPage,
      limit: Number(paging.limit) || 20,
      totalPages: Math.max(1, Number(paging.totalPages) || 1),
    };
  }

  private cell(text: any, kind?: ComplianceCell['kind'], tone?: ComplianceTone, id?: string, scoreValue?: number): ComplianceCell {
    if (kind === 'action' && (text === null || text === undefined || text === '')) return { text: '', kind, tone };
    const label = text === null || text === undefined || text === '' ? '—' : String(text);
    if (kind === 'person') return { text: label, kind, tone, id: id ?? '', initials: label.startsWith('[') ? '?' : label.split(' ').map(part => part[0]).slice(0, 2).join('') };
    if (kind === 'score') return { text: label, kind, score: (scoreValue ?? Number(text)) || 0, color: tone === 'red' ? '#ff3b47' : tone === 'amber' ? '#ffb627' : '#2bd4a1' };
    return { text: label, kind, tone, id };
  }

  private makeRow(cells: ComplianceCell[], ...filters: string[]): ComplianceRow {
    return { cells, filters };
  }

  private caseRow(item: any): ComplianceRow {
    const type = String(item.risk_type ?? item.type ?? item.case_type ?? 'Compliance');
    const caseReference = item.case_id ?? item.ref ?? item.case_ref ?? item.id;
    const caseId = String(item.id ?? item.case_id ?? item.ref ?? item.case_ref ?? '');
    const typeFilter = ['aml', 'sof', 'kyc1', 'pep', 'fraud'].find(key => type.toLowerCase().includes(key)) ?? type.toLowerCase().split(/[^a-z0-9]+/)[0];
    const row = this.makeRow([
      this.cell(caseReference, 'mono', 'blue', caseId),
      this.cell(item.name ?? item.user_name, 'person', undefined, item.usercode ?? item.user_id),
      this.cell(type, 'badge'), this.cell(item.trigger ?? item.reason),
      this.cell(item.risk_score ?? item.score ?? 0, 'score', Number(item.risk_score ?? item.score) >= 80 ? 'red' : 'amber'),
      this.cell(item.age ?? (item.created_at ? this.elapsed(item.created_at) : '—'), 'mono'),
      this.cell(item.assignee ?? item.assigned_to ?? 'Unassigned', 'badge', 'blue'),
      this.cell(item.status ?? 'Open', 'badge', 'amber'),
    ], typeFilter);
    row.caseId = item.id ?? item.case_id ?? item.ref ?? item.case_ref;
    row.userId = item.user_id ?? item.userid;
    return row;
  }

  private kyc0Row(item: any): ComplianceRow {
    const result = String(item.result ?? item.status ?? 'pending').toLowerCase();
    const email = item.email_verified === true;
    const dob = item.dob_submitted === true;
    const age = item.age_check === true;
    return this.makeRow([
      this.cell(item.name, 'person', undefined, item.usercode ?? item.user_id),
      this.cell(email ? 'Verified' : 'Pending', 'badge', email ? 'green' : 'amber'),
      this.cell(dob ? 'Submitted' : 'Missing', 'mono'),
      this.cell(age ? 'Passed' : 'Review', 'badge', age ? 'green' : 'red'),
      this.cell(item.registered_at ? this.formatDate(item.registered_at) : '—', 'mono'),
      this.cell(item.deposit_attempts ?? 0, 'mono'),
      this.cell(result, 'badge', result === 'passed' ? 'green' : result === 'failed' ? 'red' : 'amber'),
      this.cell(result === 'pending' ? 'Review' : '' , 'action', 'red'),
    ], result === 'passed' ? 'all' : result === 'failed' ? 'failed' : 'pending', ...(age ? [] : ['under18']));
  }

  private kyc1Row(item: any): ComplianceRow {
    const status = String(item.kyc_status ?? item.status ?? 'not_started').toLowerCase();
    const filter = status === 'approved' || status === 'completed' ? 'pass' : status === 'rejected' ? 'retry' : status === 'expired' ? 'expired' : 'manual';
    const row = this.makeRow([
      this.cell(item.name, 'person', undefined, item.usercode ?? item.user_id),
      this.cell(item.doc_type ?? item.document_type ?? '—'),
      this.cell(item.sumsub_applicant ?? '—', 'mono'),
      this.cell(item.ai_score ?? item.score ?? '—', (item.ai_score ?? item.score) == null ? 'mono' : 'score', 'amber'),
      this.cell(item.registered_at ? this.formatDate(item.registered_at) : '—', 'mono'),
      this.cell(item.trigger ?? '—'),
      this.cell(status.replace(/_/g, ' '), 'badge', status === 'approved' ? 'green' : status === 'rejected' ? 'red' : 'amber'),
      this.cell(status === 'approved' || status === 'completed' ? '' : 'Review', 'action', 'red'),
    ], filter);
    row.userId = item.user_id ?? item.userid ?? item.id;
    return row;
  }

  private amlRow(item: any): ComplianceRow {
    const priority = String(item.risk_level ?? item.priority ?? 'low').toLowerCase();
    return this.makeRow([
      this.cell(item.name, 'person', undefined, item.usercode ?? item.user_id),
      this.cell(item.score ?? item.aml_score ?? 0, 'score', priority === 'high' ? 'red' : priority === 'medium' ? 'amber' : 'green'),
      this.cell(item.trigger ?? item.reason), this.cell(item.case_id ?? item.case_ref ?? '—', 'mono', 'blue'),
      this.cell(item.flagged_at ? this.formatDate(item.flagged_at) : '—', 'mono'),
      this.cell(item.mlro ?? item.assigned_to ?? 'Unassigned'), this.cell(item.sar_status ?? item.sar_ref ?? '—', 'badge'),
      this.cell(item.status ?? 'Open', 'badge', priority === 'high' ? 'red' : 'amber'),
    ], priority, ...(item.status === 'open' ? ['open'] : []), ...(item.sar_ref || item.sar_status === 'filed' ? ['sar'] : []));
  }

  private sofRow(item: any): ComplianceRow {
    const status = String(item.status ?? 'pending').toLowerCase();
    const row = this.makeRow([
      this.cell(item.name, 'person', undefined, item.usercode ?? item.user_id), this.cell(item.trigger ?? item.reason),
      this.cell(this.currency(item.amount ?? item.deposit_amount), 'mono'), this.cell(item.requested_at ? this.formatDate(item.requested_at) : '—', 'mono'),
      this.cell(item.evidence ?? item.evidence_status ?? '—', undefined, status === 'cleared' ? 'green' : 'amber'),
      this.cell(item.age ?? '—', 'mono'), this.cell(item.reviewer ?? item.assigned_to ?? 'Unassigned'),
      this.cell(status, 'badge', status === 'cleared' ? 'green' : status === 'overdue' ? 'red' : 'amber'),
      this.cell(status !== 'cleared' ? 'Verify' : '', 'action', 'green'),
    ], status === 'evidence_received' ? 'evidence' : status);
    row.userId = item.user_id ?? item.userid ?? item.id;
    return row;
  }

  private sofCandidateRow(item: any): ComplianceRow {
    return this.sofRow({ ...item, status: item.status ?? 'pending', trigger: item.trigger ?? 'Candidate' });
  }

  private pepRow(item: any): ComplianceRow {
    const category = String(item.category ?? item.match_type ?? 'clear').toLowerCase();
    const filter = category.includes('sanction') ? 'sanctions' : category.includes('pep') ? 'pep' : category.includes('false') ? 'false-positive' : 'clear';
    return this.makeRow([
      this.cell(item.name, 'person', undefined, item.usercode ?? item.user_id), this.cell(item.category ?? item.match_type ?? 'Clear', 'badge', filter === 'sanctions' ? 'red' : 'amber'),
      this.cell(item.match_score ?? item.score ?? '—', (item.match_score ?? item.score) == null ? 'mono' : 'score', 'amber'), this.cell(item.source_list ?? item.source ?? '—', 'mono'),
      this.cell(item.flagged_at ? this.formatDate(item.flagged_at) : '—', 'mono'), this.cell(item.edd_status ?? '—'), this.cell(item.reviewer ?? item.assigned_to ?? '—'),
      this.cell(item.status ?? 'Pending', 'badge', filter === 'sanctions' ? 'red' : filter === 'clear' ? 'green' : 'amber'),
    ], filter);
  }

  private suspiciousRow(item: any): ComplianceRow {
    const status = String(item.status ?? 'open').toLowerCase();
    const sarFiled = Boolean(item.sar_ref ?? item.sar_filed);
    return this.makeRow([
      this.cell(item.ref ?? item.sar_id ?? item.case_id, 'mono', 'blue'), this.cell(item.name, 'person', undefined, item.usercode ?? item.user_id),
      this.cell(item.activity_type ?? item.description ?? item.trigger), this.cell(item.flagged_at ? this.formatDate(item.flagged_at) : '—', 'mono'),
      this.cell(item.mlro ?? item.assigned_to ?? 'Unassigned'), this.cell(item.sar_ref ?? '—', 'badge', sarFiled ? 'green' : 'amber'),
      this.cell(item.tipping_off_risk ? 'Active' : '—', 'badge', item.tipping_off_risk ? 'red' : 'muted'),
      this.cell(status, 'badge', status === 'closed' ? 'green' : status === 'open' ? 'red' : 'amber'),
    ], status === 'closed' ? 'closed' : sarFiled ? 'filed' : status === 'mlro_review' ? 'mlro' : 'open');
  }

  private currency(value: any): string {
    return value == null ? '—' : new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 2 }).format(Number(value) || 0);
  }

  private formatDate(value: any): string {
    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }

  private elapsed(value: any): string {
    const date = new Date(String(value)).getTime();
    if (Number.isNaN(date)) return String(value);
    const hours = Math.max(0, Math.floor((Date.now() - date) / 3600000));
    return hours < 24 ? `${hours}h` : `${Math.floor(hours / 24)}d`;
  }

  previousPage(): void { if (this.pagination && this.pagination.page > 1) this.loadCurrentView(this.pagination.page - 1); }
  nextPage(): void { if (this.pagination && this.pagination.page < this.pagination.totalPages) this.loadCurrentView(this.pagination.page + 1); }

  selectCase(row: ComplianceRow): void {
    const reference = row.caseId ?? row.cells[0]?.id ?? row.cells[0]?.text;
    if (!reference || reference === '—') return;
    this.selectedCaseId = reference;
    this.selectedCaseForm = null;
    this.selectedCaseLoading = true;
    this.selectedCaseError = '';
    const sequence = ++this.caseRequestSequence;
    this.admin.getCaseById(reference).subscribe({
      next: response => {
        if (sequence !== this.caseRequestSequence) return;
        this.selectedCase = response?.data ?? response;
        this.selectedCaseLoading = false;
      },
      error: () => {
        if (sequence !== this.caseRequestSequence) return;
        this.selectedCaseLoading = false;
        this.selectedCaseError = 'Case details could not be loaded.';
      },
    });
  }

  handleTopbarAction(action: 'primary' | 'secondary'): void {
    const label = action === 'primary' ? this.page.primaryAction : this.page.secondaryAction;
    if (action === 'secondary' && this.pageKey === 'cases') { this.showCreateCaseForm = !this.showCreateCaseForm; return; }
    if (action === 'secondary' && this.pageKey === 'sof') { this.showSofChaseForm = !this.showSofChaseForm; return; }
    this.notice = `${label} selected.`;
  }

  handleRowAction(label: string, row: ComplianceRow): void {
    const person = row.cells.find(cell => cell.kind === 'person');
    if (label === 'Review' && this.pageKey === 'kyc1' && row.userId != null) {
      this.kyc1User = row; this.kyc1Status = 'approved'; this.kyc1Reason = 'Documents verified manually'; return;
    }
    if (label === 'Verify' && (this.pageKey === 'sof' || this.pageKey === 'sofCandidates') && row.userId != null) {
      this.sofUser = row; this.sofVerified = true; this.sofReason = 'Payslips approved'; return;
    }
    this.notice = `${label} selected${person ? ` for ${person.text}` : ''}.`;
  }

  openCaseForm(form: 'update' | 'note' | 'action'): void { this.selectedCaseForm = form; }
  clearNotice(): void { this.notice = ''; this.errorNotice = ''; }

  submitCreateCase(): void {
    const userId = this.createCaseUserId.trim();
    if (!userId || !this.createCaseTitle.trim()) { this.errorNotice = 'Enter a user ID and case title.'; return; }
    this.caseMutationSubmitting = true; this.clearNotice();
    this.admin.createCase({ user_id: /^\d+$/.test(userId) ? Number(userId) : userId, case_type: this.createCaseType,
      title: this.createCaseTitle.trim(), trigger_text: this.createCaseTrigger.trim(), risk_score: Number(this.createCaseRiskScore),
      amount: Number(this.createCaseAmount), note: this.createCaseNote.trim() }).subscribe({
      next: response => { this.caseMutationSubmitting = false; if (response?.success === false) { this.errorNotice = response.message || 'Could not create the case.'; return; }
        this.showCreateCaseForm = false; this.notice = response?.message || 'Case created successfully.'; this.loadCurrentView(1); },
      error: error => { this.caseMutationSubmitting = false; this.mutationError(error, 'create case'); },
    });
  }

  submitCaseUpdate(): void {
    if (this.selectedCaseId == null) return;
    this.caseMutationSubmitting = true; this.clearNotice();
    const assigned = this.caseAssignedTo.trim();
    this.admin.updateCase(this.selectedCaseId, { status: this.caseUpdateStatus, assigned_to: /^\d+$/.test(assigned) ? Number(assigned) : assigned, note: this.caseUpdateNote.trim() }).subscribe({
      next: response => { this.caseMutationSubmitting = false; if (response?.success === false) { this.errorNotice = response.message || 'Could not update the case.'; return; }
        this.notice = response?.message || 'Case updated successfully.'; this.selectedCaseForm = null; this.loadCurrentView(this.pagination?.page ?? 1); this.reloadSelectedCase(); },
      error: error => { this.caseMutationSubmitting = false; this.mutationError(error, 'update case'); },
    });
  }

  submitCaseNote(): void {
    if (this.selectedCaseId == null || !this.caseNoteText.trim()) return;
    this.caseMutationSubmitting = true; this.clearNotice();
    this.admin.addCaseNote(this.selectedCaseId, this.caseNoteText.trim()).subscribe({
      next: response => { this.caseMutationSubmitting = false; if (response?.success === false) { this.errorNotice = response.message || 'Could not add the note.'; return; }
        this.notice = response?.message || 'Case note added successfully.'; this.selectedCaseForm = null; this.reloadSelectedCase(); },
      error: error => { this.caseMutationSubmitting = false; this.mutationError(error, 'add case note'); },
    });
  }

  submitCaseAction(): void {
    if (this.selectedCaseId == null) return;
    const payload: Record<string, unknown> = { action: this.caseActionType };
    if (this.caseActionType === 'request_docs') payload['message'] = this.caseActionMessage.trim();
    else if (this.caseActionType === 'file_sar') { payload['sar_ref'] = this.caseSarRef.trim(); payload['note'] = this.caseActionNote.trim(); }
    else payload['note'] = this.caseActionNote.trim();
    this.caseActionSubmitting = true; this.clearNotice();
    this.admin.caseAction(this.selectedCaseId, payload).subscribe({
      next: response => { this.caseActionSubmitting = false; if (response?.success === false) { this.errorNotice = response.message || 'Could not submit the case action.'; return; }
        this.notice = response?.message || `Case action “${this.caseActionType}” completed.`; this.selectedCaseForm = null; this.loadCurrentView(this.pagination?.page ?? 1); this.reloadSelectedCase(); },
      error: error => { this.caseActionSubmitting = false; this.mutationError(error, 'submit case action'); },
    });
  }

  submitKyc1Update(): void {
    const id = this.kyc1User?.userId;
    if (id == null) return;
    this.kyc1Submitting = true; this.clearNotice();
    this.admin.updateKyc1(id, { kyc_status: this.kyc1Status, reason: this.kyc1Reason.trim() }).subscribe({
      next: response => { this.kyc1Submitting = false; if (response?.success === false) { this.errorNotice = response.message || 'Could not update KYC1.'; return; }
        this.notice = response?.message || 'KYC1 status updated.'; this.kyc1User = null; this.loadCurrentView(this.pagination?.page ?? 1); },
      error: error => { this.kyc1Submitting = false; this.mutationError(error, 'update KYC1'); },
    });
  }

  submitSofChase(): void {
    const days = Number(this.sofChaseDays);
    if (!Number.isInteger(days) || days < 1) { this.errorNotice = 'Enter a number of days greater than zero.'; return; }
    this.sofChaseSubmitting = true; this.clearNotice();
    this.admin.chaseOverdueSof(days).subscribe({
      next: response => { this.sofChaseSubmitting = false; if (response?.success === false) { this.errorNotice = response.message || 'Could not chase overdue SoF requests.'; return; }
        this.notice = response?.message || `Overdue SoF requests chased for ${days} days.`; this.showSofChaseForm = false; this.loadCurrentView(this.pagination?.page ?? 1); },
      error: error => { this.sofChaseSubmitting = false; this.mutationError(error, 'chase overdue SoF requests'); },
    });
  }

  submitSofUpdate(): void {
    const id = this.sofUser?.userId;
    if (id == null) return;
    this.sofSubmitting = true; this.clearNotice();
    this.admin.updateSof(id, { verified: this.sofVerified, reason: this.sofReason.trim() }).subscribe({
      next: response => { this.sofSubmitting = false; if (response?.success === false) { this.errorNotice = response.message || 'Could not update SoF verification.'; return; }
        this.notice = response?.message || 'Source-of-funds status updated.'; this.sofUser = null; this.loadCurrentView(this.pagination?.page ?? 1); },
      error: error => { this.sofSubmitting = false; this.mutationError(error, 'update source of funds'); },
    });
  }

  private reloadSelectedCase(): void {
    const id = this.selectedCaseId;
    if (id != null) this.selectCase({ caseId: id, cells: [{ text: String(id) }], filters: [] });
  }

  private mutationError(error: any, operation: string): void {
    this.errorNotice = error?.error?.message || (error?.status === 0 ? 'The Compliance API could not be reached.' : `Could not ${operation} (HTTP ${error?.status ?? 'error'}).`);
  }

  trackByIndex(index: number): number {
    return index;
  }

  ngOnDestroy(): void {
    this.routeData?.unsubscribe();
  }
}
