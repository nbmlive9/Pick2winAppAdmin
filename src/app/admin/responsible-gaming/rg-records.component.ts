import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from 'src/app/core/services/admin.service';
import { asapScheduler, Subscription } from 'rxjs';
import { observeOn } from 'rxjs/operators';
import { RgMetric, RgRecordsPage, RgRow, RgTone, rgMetric } from './rg.models';
import { rgRecordsPages, RgRecordsView } from './rg-records.data';

@Component({
  selector: 'app-rg-records',
  templateUrl: './rg-records.component.html',
  styleUrls: ['./rg-records.component.css'],
})
export class RgRecordsComponent implements OnInit, OnDestroy {
  page: RgRecordsPage = rgRecordsPages['deposit-limits'];
  activeFilter = 'all';
  searchTerm = '';
  notice = '';
  isDepositLimitsView = false;
  isLimitChangesView = false;
  isMonthlyLossView = false;
  isSelfExclusionView = false;
  isAlertsView = false;
  loading = false;
  errorNotice = '';
  selectedLimitRow: RgRow | null = null;
  depositLimitValue = '';
  depositLimitReason = 'Affordability checked';
  depositLimitSubmitting = false;
  isApplyingDueLimitChanges = false;
  selectedLimitRequest: RgRow | null = null;
  applyLimitReason = 'Cooling-off complete';
  applyLimitForce = false;
  applyLimitSubmitting = false;
  limitChangeAction: 'apply' | 'reject' = 'apply';
  selectedInterventionUser: RgRow | null = null;
  interventionChannel = 'notification';
  interventionTitle = 'Time for a break?';
  interventionMessage = "You've had a few tough months. Set a lower limit in Settings.";
  interventionSubmitting = false;
  showBulkInterventionForm = false;
  selectedBulkUsers: RgRow[] = [];
  bulkInterventionChannel = 'notification';
  bulkInterventionTitle = 'Responsible gaming check-in';
  bulkInterventionMessage = 'Tools to help you stay in control are in Settings.';
  bulkInterventionSubmitting = false;
  showCreateSelfExclusionForm = false;
  selfExclusionUserId = '';
  selfExclusionDuration = '6M';
  selfExclusionGamstopStatus = 'pending';
  selfExclusionReason = 'User request';
  selectedSelfExclusion: RgRow | null = null;
  selfExclusionUpdateGamstopStatus = 'registered';
  selfExclusionMarketingBlocked = true;
  selfExclusionSubmitting = false;
  selectedRgAlert: RgRow | null = null;
  rgAlertStatus = 'resolved';
  rgAlertActionTaken = 'Phoned user, limit reduced';
  rgAlertSubmitting = false;
  bulkAlertFormOpen = false;
  selectedBulkAlerts: RgRow[] = [];
  bulkAlertTitle = "We're here to help";
  bulkAlertMessage = 'See our safer gambling tools.';
  bulkAlertSubmitting = false;
  scanningRgAlerts = false;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null = null;
  private routeData?: Subscription;
  private requestSequence = 0;

  constructor(
    private route: ActivatedRoute,
    private admin: AdminService,
  ) {
    this.setPage(
      this.route.snapshot.data['view'] as RgRecordsView | undefined,
      false,
    );
  }

  get filteredRows() {
    const query = this.searchTerm.trim().toLowerCase();
    return this.page.rows.filter(row => {
      const matchesFilter = this.activeFilter === 'all' || row.filters.includes(this.activeFilter);
      const searchableText = `${row.name} ${row.id} ${row.cells.map(cell => cell.value).join(' ')}`;
      return matchesFilter && (!query || searchableText.toLowerCase().includes(query));
    });
  }

  ngOnInit(): void {
    this.routeData = this.route.data.pipe(observeOn(asapScheduler))
      .subscribe(data => this.setPage(data['view'] as RgRecordsView | undefined));
  }

  private setPage(view: RgRecordsView | undefined, load = true): void {
    if (!view) {
      return;
    }

    this.requestSequence++;
    this.loading = false;
    this.errorNotice = '';
    this.pagination = null;
    this.showBulkInterventionForm = false;
    this.selectedBulkUsers = [];
    this.selectedInterventionUser = null;
    this.isDepositLimitsView = view === 'deposit-limits';
    this.isLimitChangesView = view === 'limit-reductions';
    this.isMonthlyLossView = view === 'monthly-loss';
    this.isSelfExclusionView = view === 'self-exclusion';
    this.isAlertsView = view === 'alerts';
    this.showCreateSelfExclusionForm = false;
    this.selectedSelfExclusion = null;
    this.selectedRgAlert = null;
    this.bulkAlertFormOpen = false;
    this.selectedBulkAlerts = [];
    this.showBulkInterventionForm = false;
    this.selectedBulkUsers = [];
    this.selectedInterventionUser = null;
    this.page = rgRecordsPages[view];
    this.activeFilter = 'all';
    this.searchTerm = '';
    this.notice = '';
    if (this.isDepositLimitsView) {
      this.setDepositLimitsLoadingPage();
      if (load) this.loadDepositLimits(1);
    } else if (this.isLimitChangesView) {
      this.setLimitChangesLoadingPage();
      if (load) this.loadLimitChanges(1);
    } else if (this.isMonthlyLossView) {
      this.setDynamicLoadingPage('monthly-loss', 'Loading monthly-loss users…');
      if (load) this.loadMonthlyLossUsers(1);
    } else if (this.isSelfExclusionView) {
      this.setDynamicLoadingPage('self-exclusion', 'Loading self-exclusion records…');
      if (load) this.loadSelfExclusions(1);
    } else if (this.isAlertsView) {
      this.setDynamicLoadingPage('alerts', 'Loading responsible-gaming alerts…');
      if (load) this.loadRgAlerts(1);
    }
  }

  private setDynamicLoadingPage(view: 'monthly-loss' | 'self-exclusion' | 'alerts', description: string): void {
    this.page = {
      ...rgRecordsPages[view],
      description,
      rows: [],
      metrics: rgRecordsPages[view].metrics.map(item => ({
        ...item, value: '—', detail: 'Loading…', sparkline: '',
      })),
    };
  }

  private loadMonthlyLossUsers(pageNumber: number): void {
    this.loading = true;
    this.errorNotice = '';
    const sequence = ++this.requestSequence;
    this.admin.getMonthlyLossUsers(pageNumber, 20).subscribe({
      next: (response: any) => {
        if (sequence !== this.requestSequence) return;
        this.loading = false;
        if (!Array.isArray(response?.data)) {
          this.showDynamicFailure('monthly-loss', 'The monthly-loss response was not in the expected format.');
          return;
        }
        const summary = response.summary ?? {};
        const paging = response.pagination ?? {};
        const formatNumber = (value: unknown) => new Intl.NumberFormat('en-GB').format(Number(value) || 0);
        const formatMoney = (value: unknown) => new Intl.NumberFormat('en-GB', {
          style: 'currency', currency: 'GBP', maximumFractionDigits: 2,
        }).format(Number(value) || 0);
        const makeMetric = (label: string, value: string, detail: string, color: string, numeric = 0): RgMetric =>
          rgMetric(label, value, detail, color, [numeric, numeric]);
        const total = Number(paging.total) || 0;
        this.page = {
          ...rgRecordsPages['monthly-loss'],
          description: String(summary.loss_ratio_rule ?? 'Monthly loss users and intervention status'),
          metrics: [
            makeMetric('Monthly Loss Users', formatNumber(summary.monthly_loss_users), 'Users meeting the loss rule', '#ff3b47', Number(summary.monthly_loss_users) || 0),
            makeMetric('Consecutive Loss Months', formatNumber(summary.streak_3plus), 'Users with a 3+ month loss streak', '#ffb627', Number(summary.streak_3plus) || 0),
            makeMetric('Net Loss This Month', formatMoney(summary.net_loss_this_month), 'Across flagged users', '#ff3b47', Number(summary.net_loss_this_month) || 0),
            makeMetric('RG Interventions Sent', formatNumber(summary.interventions_sent), `${formatNumber(summary.intervention_coverage)}% coverage`, '#a78bfa', Number(summary.interventions_sent) || 0),
          ],
          rows: response.data.map((item: any): RgRow => {
            const streak = Number(item.loss_streak_months ?? item.loss_streak ?? item.consecutive_loss_months ?? 0);
            const tier = String(item.tier ?? 'Unknown');
            const loss = item.net_loss ?? item.net_loss_this_month ?? item.monthly_net_loss ?? item.loss_amount;
            const limitSet = item.limit_set ?? item.has_limit ?? item.deposit_limit_set;
            const hasLimit = limitSet === true || String(limitSet ?? '').toLowerCase() === 'set';
            const intervention = item.intervention_sent ?? item.intervention_status ?? item.rg_sent;
            const sent = intervention === true || String(intervention ?? '').toLowerCase() === 'sent';
            const lastAction = item.last_action ?? item.last_intervention_at ?? item.last_action_at;
            const status = String(item.status ?? (sent ? 'Monitored' : 'Review'));
            return {
              name: String(item.name ?? item.user_name ?? 'Unknown user'),
              id: String(item.usercode ?? item.user_id ?? '—'),
              filters: [
                ...(streak >= 3 ? ['streak'] : []),
                ...(tier.toLowerCase() === 'student' ? ['student'] : []),
                ...(limitSet == null || limitSet === false || String(limitSet).toLowerCase() === 'none' || String(limitSet).toLowerCase() === 'false' ? ['no-limit'] : []),
                ...(!sent ? ['no-intervention'] : []),
              ],
              highlight: !sent || streak >= 3,
              cells: [
                { value: tier, tone: tier.toLowerCase() === 'student' ? 'red' : 'muted', badge: true },
                { value: loss == null ? '—' : formatMoney(loss), tone: 'red' },
                { value: `${formatNumber(streak)} month${streak === 1 ? '' : 's'}`, tone: streak >= 3 ? 'red' : 'muted' },
                { value: hasLimit ? 'Set' : 'None', tone: hasLimit ? 'green' : 'amber', badge: true },
                { value: sent ? 'Sent' : 'Not sent', tone: sent ? 'green' : 'red', badge: true },
                { value: lastAction == null ? '—' : this.formatRecordDate(lastAction), tone: 'muted' },
                {
                  value: sent ? status : 'Intervene',
                  tone: sent ? 'green' : 'red',
                  badge: sent,
                  action: !sent,
                },
              ],
              userId: item.user_id ?? item.userid ?? item.id,
            };
          }),
        };
        this.setPagination(paging, total, pageNumber);
      },
      error: error => this.handleDynamicError(sequence, error, 'monthly-loss'),
    });
  }

  private loadSelfExclusions(pageNumber: number): void {
    this.loading = true;
    this.errorNotice = '';
    const sequence = ++this.requestSequence;
    const filter = this.activeFilter === 'all' ? '' : this.activeFilter;
    this.admin.getSelfExclusions(pageNumber, 20, filter, this.searchTerm.trim()).subscribe({
      next: (response: any) => {
        if (sequence !== this.requestSequence) return;
        this.loading = false;
        if (!Array.isArray(response?.data)) {
          this.showDynamicFailure('self-exclusion', 'The self-exclusion response was not in the expected format.');
          return;
        }
        const summary = response.summary ?? {};
        const paging = response.pagination ?? {};
        const formatNumber = (value: unknown) => new Intl.NumberFormat('en-GB').format(Number(value) || 0);
        const total = Number(paging.total) || 0;
        this.page = {
          ...rgRecordsPages['self-exclusion'],
          description: `${formatNumber(total)} self-exclusion records`,
          metrics: [
            this.simpleMetric('Active Exclusions', summary.active_exclusions, 'Currently active', '#ff3b47'),
            this.simpleMetric('Expiring Next 30 Days', summary.expiring_next_30d, 'Upcoming exclusion end dates', '#ffb627'),
            this.simpleMetric('GAMSTOP Registered', summary.gamstop_registered, 'National self-exclusion registrations', '#a78bfa'),
            this.simpleMetric('Expired (30d)', summary.expired_30d, 'Exclusions expired in the last 30 days', '#2bd4a1'),
          ],
          rows: response.data.map((item: any): RgRow => {
            const status = String(item.status ?? 'unknown');
            const normalizedStatus = status.toLowerCase();
            const gamstop = item.gamstop_registered ?? item.gamstop ?? item.gamstop_status;
            const registered = gamstop === true || ['registered', 'active', 'yes'].includes(String(gamstop ?? '').toLowerCase());
            const expiring = item.expiring_soon === true || item.expiring_next_30d === true;
            const started = item.started_at ?? item.start_date ?? item.exclusion_started_at;
            const expires = item.expires_at ?? item.expiry_date ?? item.end_date ?? item.exclusion_ends_at;
            const marketingBlocked = item.marketing_blocked ?? item.marketing_suppressed;
            const balance = item.balance_returned ?? item.refunded_balance ?? item.balance_at_exclusion;
            const duration = item.duration ?? item.duration_label ?? item.exclusion_period ?? '—';
            return {
              name: String(item.name ?? item.user_name ?? (item.user_id ? `User ${item.user_id}` : 'Excluded user')),
              id: String(item.usercode ?? item.user_id ?? '—'),
              userId: item.user_id ?? item.userid,
              selfExclusionId: item.self_exclusion_id ?? item.selfExclusionId ?? item.exclusion_id ?? item.id,
              gamstopStatus: String(item.gamstop_status ?? item.gamstopStatus ?? (registered ? 'registered' : 'pending')),
              marketingBlocked: marketingBlocked === true,
              filters: [
                ...(normalizedStatus === 'active' ? ['active'] : []),
                ...(registered ? ['gamstop'] : []),
                ...(expiring ? ['expiring'] : []),
                ...(normalizedStatus === 'expired' ? ['expired'] : []),
              ],
              cells: [
                { value: String(duration) },
                { value: started == null ? '—' : this.formatRecordDate(started), tone: 'muted' },
                { value: expires == null ? '—' : this.formatRecordDate(expires), tone: expiring ? 'red' : 'muted' },
                { value: registered ? 'Registered' : 'Not registered', tone: registered ? 'green' : 'red', badge: true },
                { value: marketingBlocked === true ? 'Blocked' : marketingBlocked === false ? 'Not blocked' : '—', tone: marketingBlocked === true ? 'green' : 'muted', badge: true },
                { value: balance == null ? '—' : this.formatMoney(balance), tone: 'muted' },
                { value: status.charAt(0).toUpperCase() + status.slice(1), tone: normalizedStatus === 'active' ? 'red' : normalizedStatus === 'expired' ? 'muted' : 'amber', badge: true },
              ],
            };
          }),
        };
        this.setPagination(paging, total, pageNumber);
      },
      error: error => this.handleDynamicError(sequence, error, 'self-exclusion'),
    });
  }

  private simpleMetric(label: string, value: unknown, detail: string, color: string): RgMetric {
    const count = Number(value) || 0;
    return rgMetric(label, new Intl.NumberFormat('en-GB').format(count), detail, color, [count, count]);
  }

  private setPagination(paging: any, total: number, requestedPage: number): void {
    this.pagination = {
      total,
      page: Number(paging.page) || requestedPage,
      limit: Number(paging.limit) || 20,
      totalPages: Math.max(1, Number(paging.totalPages) || 1),
    };
  }

  private formatRecordDate(value: unknown): string {
    const date = new Date(String(value));
    return Number.isNaN(date.getTime())
      ? String(value)
      : new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }

  private formatMoney(value: unknown): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency', currency: 'GBP', maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  }

  private handleDynamicError(sequence: number, error: any, view: 'monthly-loss' | 'self-exclusion' | 'alerts'): void {
    if (sequence !== this.requestSequence) return;
    const detail = typeof error.error?.message === 'string'
      ? error.error.message
      : error.status === 0
        ? 'The API could not be reached (network or CORS error).'
        : `HTTP ${error.status}${error.statusText ? ` ${error.statusText}` : ''}.`;
    const label = view === 'monthly-loss' ? 'monthly-loss users' : view === 'self-exclusion' ? 'self-exclusions' : 'RG alerts';
    this.showDynamicFailure(view, `Could not load ${label}: ${detail}`);
  }

  private showDynamicFailure(view: 'monthly-loss' | 'self-exclusion' | 'alerts', message: string): void {
    this.loading = false;
    this.errorNotice = message;
    this.pagination = null;
    this.page = {
      ...rgRecordsPages[view],
      description: 'API data is unavailable.',
      metrics: rgRecordsPages[view].metrics.map(item => ({ ...item, value: '—', detail: 'Unavailable', sparkline: '' })),
      rows: [],
    };
  }

  private loadRgAlerts(pageNumber: number): void {
    this.loading = true;
    this.errorNotice = '';
    const sequence = ++this.requestSequence;
    this.admin.getRgAlerts(pageNumber, 20).subscribe({
      next: (response: any) => {
        if (sequence !== this.requestSequence) return;
        this.loading = false;
        if (!Array.isArray(response?.data)) {
          this.showDynamicFailure('alerts', 'The RG alerts response was not in the expected format.');
          return;
        }
        const summary = response.summary ?? {};
        const paging = response.pagination ?? {};
        const number = (value: unknown) => new Intl.NumberFormat('en-GB').format(Number(value) || 0);
        const openAlerts = Number(summary.open_alerts) || 0;
        const highAlerts = Number(summary.open_high) || 0;
        const unread = Number(summary.unread) || 0;
        const interventions = Number(summary.interventions_7d) || 0;
        const averageResponse = Number(summary.avg_response_hours) || 0;
        const resolved = Number(summary.resolved_30d) || 0;
        const total = Number(paging.total) || 0;
        this.page = {
          ...rgRecordsPages.alerts,
          description: `${number(total)} alert records · ${number(unread)} unread`,
          metrics: [
            rgMetric('Open Alerts', number(openAlerts), `${number(highAlerts)} high · ${number(unread)} unread`, '#ff3b47', [openAlerts, openAlerts]),
            rgMetric('Sent Interventions (7d)', number(interventions), 'Interventions in the last 7 days', '#a78bfa', [interventions, interventions]),
            rgMetric('Avg Response Time', `${number(averageResponse)}h`, 'Target under 6 hours', '#2bd4a1', [averageResponse, averageResponse]),
            rgMetric('Resolved (30d)', number(resolved), 'Alerts resolved in the last 30 days', '#5b8def', [resolved, resolved]),
          ],
          rows: response.data.map((item: any): RgRow => {
            const priority = String(item.priority ?? item.severity ?? 'low');
            const normalizedPriority = priority.toLowerCase();
            const status = String(item.status ?? 'open');
            const resolvedRow = normalizedPriority === 'resolved' || status.toLowerCase() === 'resolved';
            const alertType = String(item.alert_type ?? item.type ?? item.title ?? 'RG Alert');
            const trigger = String(item.trigger ?? item.trigger_code ?? item.rule_code ?? item.code ?? '—');
            const assigned = String(item.assigned_to ?? item.assignee ?? item.assigned ?? 'Unassigned');
            const actionTaken = String(item.action_taken ?? item.last_action ?? item.intervention ?? '—');
            const age = item.age ?? item.age_label ?? (item.created_at ? this.elapsedAge(item.created_at) : '—');
            const unreadRow = item.unread === true || item.is_read === false || item.read === false;
            const priorityTone: RgTone = normalizedPriority === 'high' ? 'red'
              : normalizedPriority === 'medium' ? 'amber'
                : normalizedPriority === 'low' ? 'blue' : 'muted';
            return {
              name: String(item.user_name ?? item.name ?? item.usercode ?? 'Unknown user'),
              id: String(item.usercode ?? item.user_id ?? item.id ?? '—'),
              alertId: item.alert_id ?? item.alertId ?? item.id,
              userId: item.user_id ?? item.userid,
              filters: [
                ...(resolvedRow ? ['resolved'] : []),
                ...(!resolvedRow && ['high', 'medium', 'low'].includes(normalizedPriority) ? [normalizedPriority] : []),
              ],
              highlight: !resolvedRow && (normalizedPriority === 'high' || unreadRow),
              cells: [
                { value: alertType },
                { value: trigger, tone: 'muted' },
                { value: priority.charAt(0).toUpperCase() + priority.slice(1), tone: priorityTone, badge: true },
                { value: String(age) },
                { value: assigned, tone: assigned.toLowerCase() === 'unassigned' ? 'red' : 'muted' },
                { value: actionTaken, tone: actionTaken === '—' ? 'muted' : 'green' },
                { value: resolvedRow ? 'Resolved' : unreadRow ? 'Unread' : status, tone: resolvedRow ? 'green' : unreadRow ? 'amber' : 'muted', badge: true },
              ],
            };
          }),
        };
        this.setPagination(paging, total, pageNumber);
      },
      error: error => this.handleDynamicError(sequence, error, 'alerts'),
    });
  }

  private elapsedAge(value: unknown): string {
    const timestamp = new Date(String(value)).getTime();
    if (Number.isNaN(timestamp)) return String(value);
    const elapsedMinutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
    if (elapsedMinutes < 60) return `${elapsedMinutes}m`;
    const elapsedHours = Math.floor(elapsedMinutes / 60);
    if (elapsedHours < 24) return `${elapsedHours}h`;
    return `${Math.floor(elapsedHours / 24)}d`;
  }

  private setLimitChangesLoadingPage(): void {
    this.page = {
      ...rgRecordsPages['limit-reductions'],
      description: 'Loading limit-change records…',
      rows: [],
      metrics: rgRecordsPages['limit-reductions'].metrics.map(item => ({
        ...item,
        value: '—',
        detail: 'Loading…',
        sparkline: '',
      })),
    };
  }

  private loadLimitChanges(pageNumber: number): void {
    this.loading = true;
    this.errorNotice = '';
    const requestSequence = ++this.requestSequence;
    this.admin.getLimitChanges(pageNumber, 20).subscribe({
      next: (response: any) => {
        if (requestSequence !== this.requestSequence) return;
        this.loading = false;
        if (!Array.isArray(response?.data)) {
          this.showLimitChangesFailure('The limit changes response was not in the expected format.');
          return;
        }
        const summary = response.summary ?? {};
        const pagination = response.pagination ?? {};
        const number = (value: unknown) => new Intl.NumberFormat('en-GB').format(Number(value) || 0);
        const money = (value: unknown) => value === null || value === undefined || value === ''
          ? '—'
          : new Intl.NumberFormat('en-GB', {
              style: 'currency', currency: 'GBP', maximumFractionDigits: 2,
            }).format(Number(value) || 0);
        const metric = (label: string, value: unknown, detail: string, color: string, suffix = ''): RgMetric => {
          const metricValue = Number(value) || 0;
          return rgMetric(label, `${number(metricValue)}${suffix}`, detail, color, [metricValue, metricValue]);
        };
        const total = Number(pagination.total) || 0;
        const reductionsPct = Number(summary.avg_reduction_pct) || 0;
        const avgOld = summary.avg_old_limit;
        const avgNew = summary.avg_new_limit;
        const averageRange = avgOld == null || avgNew == null
          ? 'Average limits unavailable'
          : `${money(avgOld)} → ${money(avgNew)} average`;
        this.page = {
          ...rgRecordsPages['limit-reductions'],
          description: `${number(total)} limit changes · reductions take effect immediately; increases follow the cooling period`,
          metrics: [
            metric('Reductions (30d)', summary.reductions_30d, 'Applied in the last 30 days', '#a78bfa'),
            metric('Awaiting Cooling', summary.awaiting_cooling, 'Requests in cooling period', '#ffb627'),
            metric('Avg Reduction %', reductionsPct, averageRange, '#2bd4a1', '%'),
            metric('Requests Today', summary.requests_today, 'Limit requests received today', '#5b8def'),
          ],
          rows: response.data.map((item: any): RgRow => {
            const requestType = String(item.request_type ?? 'unknown');
            const normalizedType = requestType.toLowerCase();
            const status = String(item.status ?? 'unknown');
            const normalizedStatus = status.toLowerCase();
            const cooling = normalizedStatus.includes('pending') || normalizedStatus.includes('cooling');
            const requestDate = item.requested_at
              ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.requested_at))
              : '—';
            const changePct = item.change_pct == null ? '—' : `${Number(item.change_pct) > 0 ? '+' : ''}${number(item.change_pct)}%`;
            const typeLabel = normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1);
            const statusTone: RgTone = cooling ? 'amber' : normalizedStatus === 'applied' ? 'green' : 'muted';
            return {
              name: String(item.name ?? 'Unknown user'),
              id: String(item.usercode ?? item.user_id ?? item.ref ?? '—'),
              limitRequestId: item.limit_request_id ?? item.limitRequestId ?? item.request_id ?? item.requestId ?? item.id,
              filters: [normalizedType, ...(cooling ? ['pending'] : [])],
              cells: [
                { value: typeLabel, tone: normalizedType === 'reduction' ? 'green' : 'amber', badge: true },
                { value: money(item.old_limit), tone: 'muted' },
                { value: money(item.new_limit) },
                { value: changePct, tone: normalizedType === 'reduction' ? 'green' : 'amber' },
                { value: requestDate, tone: 'muted' },
                { value: String(item.effective_at ?? '—') },
                { value: status.charAt(0).toUpperCase() + status.slice(1), tone: statusTone, badge: true },
              ],
            };
          }),
        };
        this.pagination = {
          total,
          page: Number(pagination.page) || pageNumber,
          limit: Number(pagination.limit) || 20,
          totalPages: Math.max(1, Number(pagination.totalPages) || 1),
        };
      },
      error: (error: any) => {
        if (requestSequence !== this.requestSequence) return;
        const detail = typeof error.error?.message === 'string'
          ? error.error.message
          : error.status === 0
            ? 'The API could not be reached (network or CORS error).'
            : `HTTP ${error.status}${error.statusText ? ` ${error.statusText}` : ''}.`;
        this.showLimitChangesFailure(`Could not load limit changes: ${detail}`);
      },
    });
  }

  private showLimitChangesFailure(message: string): void {
    this.loading = false;
    this.errorNotice = message;
    this.pagination = null;
    this.page = {
      ...rgRecordsPages['limit-reductions'],
      description: 'Limit-change data is unavailable.',
      metrics: rgRecordsPages['limit-reductions'].metrics.map(item => ({
        ...item, value: '—', detail: 'Unavailable', sparkline: '',
      })),
      rows: [],
    };
  }

  private setDepositLimitsLoadingPage(): void {
    this.page = {
      ...rgRecordsPages['deposit-limits'],
      description: 'Loading deposit-limit records…',
      rows: [],
      metrics: this.page.metrics.map((item) => ({
        ...item,
        value: '—',
        detail: 'Loading…',
        sparkline: '',
      })),
    };
  }

  private loadDepositLimits(pageNumber: number): void {
    this.loading = true;
    this.errorNotice = '';
    this.notice = '';
    const requestSequence = ++this.requestSequence;
    const filter = this.activeFilter === 'all' ? '' : this.activeFilter;
    this.admin.getDepositLimits(
      pageNumber,
      20,
      filter,
      this.searchTerm.trim(),
    ).subscribe({
      next: (response: any) => {
        if (requestSequence !== this.requestSequence) return;
        this.loading = false;
        if (!Array.isArray(response?.data)) {
          this.showDepositLimitsFailure(
            'The deposit limits response was not in the expected format.',
          );
          return;
        }
        const summary = response.summary ?? {};
        const pagination = response.pagination ?? {};
        const number = (value: unknown) =>
          new Intl.NumberFormat('en-GB').format(Number(value) || 0);
        const money = (value: unknown) =>
          new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
            maximumFractionDigits: 2,
          }).format(Number(value) || 0);
        const metric = (
          label: string,
          value: unknown,
          detail: string,
          color: string,
        ): RgMetric => {
          const metricValue = Number(value) || 0;
          return rgMetric(
            label,
            number(metricValue),
            detail,
            color,
            [metricValue, metricValue],
          );
        };
        const total = Number(pagination.total) || 0;
        const reduced = Number(summary.users_with_reduced_limit) || 0;
        const reducedPct = Number(summary.reduced_pct) || 0;
        const capBreaches = Number(summary.student_cap_breaches) || 0;
        this.page = {
          ...rgRecordsPages['deposit-limits'],
          description: `${number(total)} users · ${number(reduced)} with a reduced limit`,
          metrics: [
            metric(
              'Users With Reduced Limit',
              reduced,
              `${number(reducedPct)}% of users`,
              '#a78bfa',
            ),
            metric(
              'At Monthly Limit',
              summary.at_monthly_limit,
              'Users at their monthly cap',
              '#ff3b47',
            ),
            metric(
              'Student-Cap Breaches',
              capBreaches,
              `Student cap ${money(summary.student_cap)}`,
              '#ffb627',
            ),
            metric(
              'Deposit Limit Records',
              total,
              `Page ${Number(pagination.page) || pageNumber} of ${Number(pagination.totalPages) || 1}`,
              '#5b8def',
            ),
          ],
          columns: [
            'Tier',
            'Limit Type',
            'Cap',
            'Used Today',
            'Used Month',
            'Limit Reduced',
            'Pending Request',
            'Status',
          ],
          filters: [
            { label: 'All', key: 'all' },
            { label: 'Daily', key: 'daily' },
            { label: 'Weekly', key: 'weekly' },
            { label: 'Monthly', key: 'monthly' },
            { label: 'Student Cap', key: 'student' },
            { label: 'At Limit', key: 'at-limit' },
            { label: 'Reduced Once', key: 'reduced' },
            { label: 'Pending Request', key: 'pending' },
          ],
          rows: response.data.map((item: any): RgRow => {
            const tier = String(item.tier ?? 'Other');
            const limitType = String(item.limit_type ?? 'Unknown');
            const status = String(item.status ?? 'unknown');
            const usage = Math.max(0, Math.min(100, Number(item.usage_pct) || 0));
            const reducedOnce = Boolean(item.limit_reduced_once);
            const pending = Boolean(item.pending_request);
            const atLimit = usage >= 100 || status.toLowerCase().includes('limit');
            const filters = [
              limitType.toLowerCase(),
              ...(tier.toLowerCase() === 'student' ? ['student'] : []),
              ...(atLimit ? ['at-limit'] : []),
              ...(reducedOnce ? ['reduced'] : []),
              ...(pending ? ['pending'] : []),
            ];
            const statusTone: RgTone =
              status.toLowerCase() === 'ok'
                ? 'green'
                : atLimit || pending
                  ? 'red'
                  : 'amber';
            return {
              name: String(item.name ?? 'Unknown user'),
              id: String(item.usercode ?? item.user_id ?? '—'),
              userId: item.user_id ?? item.userid ?? item.id,
              depositLimit: Number(item.cap ?? item.deposit_limit ?? item.monthly_limit) || 0,
              filters,
              highlight: atLimit || pending,
              cells: [
                {
                  value: tier,
                  tone: tier.toLowerCase() === 'student' ? 'violet' : 'muted',
                  badge: true,
                },
                { value: limitType.charAt(0).toUpperCase() + limitType.slice(1) },
                { value: money(item.cap), tone: 'muted' },
                { value: money(item.used_today) },
                { value: money(item.used_month), tone: usage >= 90 ? 'amber' : 'muted' },
                {
                  value: reducedOnce ? 'Yes' : 'No',
                  tone: reducedOnce ? 'violet' : 'muted',
                  badge: true,
                },
                {
                  value: pending ? 'Pending' : 'None',
                  tone: pending ? 'amber' : 'muted',
                  badge: true,
                },
                {
                  value: status.charAt(0).toUpperCase() + status.slice(1),
                  tone: statusTone,
                  badge: true,
                },
              ],
            };
          }),
        };
        this.pagination = {
          total,
          page: Number(pagination.page) || pageNumber,
          limit: Number(pagination.limit) || 20,
          totalPages: Math.max(1, Number(pagination.totalPages) || 1),
        };
      },
      error: (error: any) => {
        if (requestSequence !== this.requestSequence) return;
        const detail =
          typeof error.error?.message === 'string'
            ? error.error.message
            : error.status === 0
              ? 'The API could not be reached (network or CORS error).'
              : `HTTP ${error.status}${error.statusText ? ` ${error.statusText}` : ''}.`;
        this.showDepositLimitsFailure(`Could not load deposit limits: ${detail}`);
      },
    });
  }

  private showDepositLimitsFailure(message: string): void {
    this.loading = false;
    this.errorNotice = message;
    this.pagination = null;
    this.page = {
      ...rgRecordsPages['deposit-limits'],
      description: 'Deposit-limit data is unavailable.',
      metrics: rgRecordsPages['deposit-limits'].metrics.map((item) => ({
        ...item,
        value: '—',
        detail: 'Unavailable',
        sparkline: '',
      })),
      rows: [],
    };
  }

  openDepositLimitForm(row: RgRow): void {
    if (row.userId === undefined || row.userId === null || row.userId === '') {
      this.errorNotice = 'This row does not include a user ID, so its limit cannot be updated.';
      return;
    }
    this.errorNotice = '';
    this.notice = '';
    this.selectedLimitRow = row;
    this.depositLimitValue = String(row.depositLimit ?? '');
    this.depositLimitReason = 'Affordability checked';
  }

  cancelDepositLimitForm(): void {
    this.selectedLimitRow = null;
    this.depositLimitSubmitting = false;
  }

  submitDepositLimit(event: Event): void {
    event.preventDefault();
    const row = this.selectedLimitRow;
    const depositLimit = Number(this.depositLimitValue);
    const reason = this.depositLimitReason.trim();
    if (row?.userId === undefined || row.userId === null || row.userId === '' || !Number.isFinite(depositLimit) || depositLimit < 0 || !reason || this.depositLimitSubmitting) return;

    this.depositLimitSubmitting = true;
    this.errorNotice = '';
    this.notice = '';
    this.admin.updateDepositLimit(row.userId, depositLimit, reason).subscribe({
      next: (response: any) => {
        this.depositLimitSubmitting = false;
        if (response?.success === false) {
          this.errorNotice = response?.message || response?.error || 'The API did not update the deposit limit.';
          return;
        }
        row.depositLimit = depositLimit;
        const capCell = row.cells[2];
        if (capCell) capCell.value = this.formatMoney(depositLimit);
        this.selectedLimitRow = null;
        this.notice = response?.message || `Deposit limit updated for ${row.name}.`;
      },
      error: (error: any) => {
        this.depositLimitSubmitting = false;
        this.errorNotice =
          (typeof error.error?.message === 'string' && error.error.message) ||
          (typeof error.error?.error === 'string' && error.error.error) ||
          (error.status === 0
            ? 'Could not reach the deposit limit API (network or CORS error).'
            : `Could not update deposit limit: HTTP ${error.status}${error.statusText ? ` ${error.statusText}` : ''}.`);
      },
    });
  }

  get pageRangeLabel(): string {
    if (!this.pagination || this.pagination.total === 0) return 'Showing 0 of 0 records';
    const start = (this.pagination.page - 1) * this.pagination.limit + 1;
    const end = Math.min(this.pagination.page * this.pagination.limit, this.pagination.total);
    return `Showing ${start}–${end} of ${this.pagination.total} records`;
  }

  previousPage(): void {
    if (!this.pagination || this.pagination.page <= 1) return;
    if (this.isDepositLimitsView) this.loadDepositLimits(this.pagination.page - 1);
    else if (this.isLimitChangesView) this.loadLimitChanges(this.pagination.page - 1);
    else if (this.isMonthlyLossView) this.loadMonthlyLossUsers(this.pagination.page - 1);
    else if (this.isSelfExclusionView) this.loadSelfExclusions(this.pagination.page - 1);
    else if (this.isAlertsView) this.loadRgAlerts(this.pagination.page - 1);
  }

  nextPage(): void {
    if (!this.pagination || this.pagination.page >= this.pagination.totalPages) return;
    if (this.isDepositLimitsView) this.loadDepositLimits(this.pagination.page + 1);
    else if (this.isLimitChangesView) this.loadLimitChanges(this.pagination.page + 1);
    else if (this.isMonthlyLossView) this.loadMonthlyLossUsers(this.pagination.page + 1);
    else if (this.isSelfExclusionView) this.loadSelfExclusions(this.pagination.page + 1);
    else if (this.isAlertsView) this.loadRgAlerts(this.pagination.page + 1);
  }

  setSearchTerm(value: string): void {
    this.searchTerm = value;
    if (this.isDepositLimitsView) this.loadDepositLimits(1);
    else if (this.isSelfExclusionView) this.loadSelfExclusions(1);
  }

  getInitials(name: string): string {
    return name.startsWith('[')
      ? '?'
      : name.split(' ').map(part => part[0]).join('').slice(0, 2);
  }

  setFilter(key: string): void {
    this.activeFilter = key;
    if (this.isDepositLimitsView) this.loadDepositLimits(1);
    else if (this.isSelfExclusionView) this.loadSelfExclusions(1);
    // Limit-change filters apply to the API-backed page because this endpoint
    // accepts only page and limit query parameters.
  }

  handleTopbarAction(action: 'primary' | 'secondary'): void {
    if (action === 'primary' && this.page.primaryAction.toLowerCase().includes('export')) {
      this.exportCsv();
      return;
    }

    if (action === 'secondary' && this.isLimitChangesView) {
      this.applyDueLimitChanges();
      return;
    }

    if (action === 'secondary' && this.isMonthlyLossView) {
      this.openBulkInterventionForm();
      return;
    }

    if (action === 'primary' && this.isAlertsView) {
      this.markAllRgAlertsRead();
      return;
    }

    if (action === 'secondary' && this.isAlertsView) {
      this.openBulkAlertInterventionForm();
      return;
    }

    this.notice = `${action === 'primary' ? this.page.primaryAction : this.page.secondaryAction} selected.`;
  }

  openCreateSelfExclusionForm(): void {
    this.notice = '';
    this.errorNotice = '';
    this.showCreateSelfExclusionForm = true;
    this.selectedSelfExclusion = null;
    this.selfExclusionUserId = '';
    this.selfExclusionDuration = '6M';
    this.selfExclusionGamstopStatus = 'pending';
    this.selfExclusionReason = 'User request';
  }

  submitCreateSelfExclusion(event: Event): void {
    event.preventDefault();
    const userId = this.selfExclusionUserId.trim();
    const duration = this.selfExclusionDuration.trim();
    const gamstopStatus = this.selfExclusionGamstopStatus.trim();
    const reason = this.selfExclusionReason.trim();
    if (!userId || !duration || !gamstopStatus || !reason || this.selfExclusionSubmitting) return;
    const normalizedUserId = Number.isFinite(Number(userId)) ? Number(userId) : userId;

    this.selfExclusionSubmitting = true;
    this.errorNotice = '';
    this.notice = '';
    this.admin.createSelfExclusion({
      user_id: normalizedUserId,
      duration,
      gamstop_status: gamstopStatus,
      reason,
    }).subscribe({
      next: (response: any) => {
        this.selfExclusionSubmitting = false;
        if (response?.success === false) {
          this.errorNotice = response?.message || response?.error || 'The API did not create the self-exclusion.';
          return;
        }
        this.showCreateSelfExclusionForm = false;
        this.notice = response?.message || 'Self-exclusion created successfully.';
        this.loadSelfExclusions(this.pagination?.page || 1);
      },
      error: (error: any) => {
        this.selfExclusionSubmitting = false;
        this.errorNotice = this.mutationError(error, 'create self-exclusion');
      },
    });
  }

  openSelfExclusionUpdate(row: RgRow): void {
    if (row.selfExclusionId === undefined || row.selfExclusionId === null || row.selfExclusionId === '') {
      this.errorNotice = 'This row does not include a self-exclusion ID, so it cannot be updated.';
      return;
    }
    this.notice = '';
    this.errorNotice = '';
    this.showCreateSelfExclusionForm = false;
    this.selectedSelfExclusion = row;
    this.selfExclusionUpdateGamstopStatus = row.gamstopStatus || 'registered';
    this.selfExclusionMarketingBlocked = row.marketingBlocked ?? true;
  }

  submitSelfExclusionUpdate(event: Event): void {
    event.preventDefault();
    const row = this.selectedSelfExclusion;
    const status = this.selfExclusionUpdateGamstopStatus.trim();
    if (row?.selfExclusionId === undefined || row.selfExclusionId === null || row.selfExclusionId === '' || !status || this.selfExclusionSubmitting) return;
    this.selfExclusionSubmitting = true;
    this.errorNotice = '';
    this.notice = '';
    this.admin.updateSelfExclusion(row.selfExclusionId, status, this.selfExclusionMarketingBlocked).subscribe({
      next: (response: any) => {
        this.selfExclusionSubmitting = false;
        if (response?.success === false) {
          this.errorNotice = response?.message || response?.error || 'The API did not update this self-exclusion.';
          return;
        }
        this.selectedSelfExclusion = null;
        this.notice = response?.message || `Self-exclusion updated for ${row.name}.`;
        this.loadSelfExclusions(this.pagination?.page || 1);
      },
      error: (error: any) => {
        this.selfExclusionSubmitting = false;
        this.errorNotice = this.mutationError(error, 'update self-exclusion');
      },
    });
  }

  scanRgAlerts(): void {
    if (this.scanningRgAlerts) return;
    this.scanningRgAlerts = true;
    this.notice = '';
    this.errorNotice = '';
    this.admin.scanRgAlerts().subscribe({
      next: (response: any) => {
        this.scanningRgAlerts = false;
        if (response?.success === false) {
          this.errorNotice = response?.message || response?.error || 'The alert scan did not complete.';
          return;
        }
        this.notice = response?.message || 'RG alert scan completed.';
        this.loadRgAlerts(this.pagination?.page || 1);
      },
      error: (error: any) => {
        this.scanningRgAlerts = false;
        this.errorNotice = this.mutationError(error, 'scan RG alerts');
      },
    });
  }

  markAllRgAlertsRead(): void {
    if (this.rgAlertSubmitting) return;
    this.rgAlertSubmitting = true;
    this.notice = '';
    this.errorNotice = '';
    this.admin.markAllRgAlertsRead().subscribe({
      next: (response: any) => {
        this.rgAlertSubmitting = false;
        if (response?.success === false) {
          this.errorNotice = response?.message || response?.error || 'The API did not mark all RG alerts as read.';
          return;
        }
        this.notice = response?.message || 'All RG alerts marked as read.';
        this.loadRgAlerts(this.pagination?.page || 1);
      },
      error: (error: any) => {
        this.rgAlertSubmitting = false;
        this.errorNotice = this.mutationError(error, 'mark all RG alerts as read');
      },
    });
  }

  openRgAlertUpdate(row: RgRow): void {
    if (row.alertId === undefined || row.alertId === null || row.alertId === '') {
      this.errorNotice = 'This row does not include an alert ID, so it cannot be updated.';
      return;
    }
    this.notice = '';
    this.errorNotice = '';
    this.selectedRgAlert = row;
    this.rgAlertStatus = 'resolved';
    this.rgAlertActionTaken = 'Phoned user, limit reduced';
  }

  submitRgAlertUpdate(event: Event): void {
    event.preventDefault();
    const row = this.selectedRgAlert;
    const status = this.rgAlertStatus.trim();
    const actionTaken = this.rgAlertActionTaken.trim();
    if (row?.alertId === undefined || row.alertId === null || row.alertId === '' || !status || !actionTaken || this.rgAlertSubmitting) return;
    this.rgAlertSubmitting = true;
    this.notice = '';
    this.errorNotice = '';
    this.admin.updateRgAlert(row.alertId, status, actionTaken).subscribe({
      next: (response: any) => {
        this.rgAlertSubmitting = false;
        if (response?.success === false) {
          this.errorNotice = response?.message || response?.error || 'The API did not update this RG alert.';
          return;
        }
        this.selectedRgAlert = null;
        this.notice = response?.message || `RG alert for ${row.name} updated.`;
        this.loadRgAlerts(this.pagination?.page || 1);
      },
      error: (error: any) => {
        this.rgAlertSubmitting = false;
        this.errorNotice = this.mutationError(error, 'update RG alert');
      },
    });
  }

  openBulkAlertInterventionForm(): void {
    const eligible = this.filteredRows.filter(row => row.alertId !== undefined && row.alertId !== null && row.alertId !== '');
    if (!eligible.length) {
      this.errorNotice = 'No alert IDs are available for bulk intervention on this page.';
      return;
    }
    this.notice = '';
    this.errorNotice = '';
    this.bulkAlertFormOpen = true;
    this.selectedBulkAlerts = [];
    this.bulkAlertTitle = "We're here to help";
    this.bulkAlertMessage = 'See our safer gambling tools.';
  }

  isBulkAlertSelected(row: RgRow): boolean {
    return this.selectedBulkAlerts.some(alert => String(alert.alertId) === String(row.alertId));
  }

  toggleBulkAlert(row: RgRow, checked: boolean): void {
    if (row.alertId === undefined || row.alertId === null || row.alertId === '') return;
    this.selectedBulkAlerts = checked
      ? [...this.selectedBulkAlerts.filter(alert => String(alert.alertId) !== String(row.alertId)), row]
      : this.selectedBulkAlerts.filter(alert => String(alert.alertId) !== String(row.alertId));
  }

  cancelBulkAlertIntervention(): void {
    this.bulkAlertFormOpen = false;
    this.selectedBulkAlerts = [];
    this.bulkAlertSubmitting = false;
  }

  submitBulkAlertIntervention(event: Event): void {
    event.preventDefault();
    const alertIds = this.selectedBulkAlerts
      .map(alert => alert.alertId)
      .filter((id): id is string | number => id !== undefined && id !== null && id !== '')
      .map(id => typeof id === 'string' && id.trim() !== '' && Number.isFinite(Number(id)) ? Number(id) : id);
    const title = this.bulkAlertTitle.trim();
    const message = this.bulkAlertMessage.trim();
    if (!alertIds.length || !title || !message || this.bulkAlertSubmitting) return;
    this.bulkAlertSubmitting = true;
    this.notice = '';
    this.errorNotice = '';
    this.admin.createBulkAlertIntervention({ alert_ids: alertIds, title, message }).subscribe({
      next: (response: any) => {
        this.bulkAlertSubmitting = false;
        if (response?.success === false) {
          this.errorNotice = response?.message || response?.error || 'The API did not create alert interventions.';
          return;
        }
        this.bulkAlertFormOpen = false;
        this.selectedBulkAlerts = [];
        this.notice = response?.message || `Intervention created for ${alertIds.length} selected alert${alertIds.length === 1 ? '' : 's'}.`;
        this.loadRgAlerts(this.pagination?.page || 1);
      },
      error: (error: any) => {
        this.bulkAlertSubmitting = false;
        this.errorNotice = this.mutationError(error, 'create bulk alert intervention');
      },
    });
  }

  private mutationError(error: any, action: string): string {
    return (typeof error.error?.message === 'string' && error.error.message) ||
      (typeof error.error?.error === 'string' && error.error.error) ||
      (error.status === 0
        ? `Could not reach the ${action} API (network or CORS error).`
        : `Could not ${action}: HTTP ${error.status}${error.statusText ? ` ${error.statusText}` : ''}.`);
  }

  private applyDueLimitChanges(): void {
    if (this.isApplyingDueLimitChanges) return;
    if (!window.confirm('Apply all limit changes that are due now?')) return;

    this.isApplyingDueLimitChanges = true;
    this.notice = '';
    this.errorNotice = '';
    this.admin.applyDueLimitChanges().subscribe({
      next: (response: any) => {
        this.isApplyingDueLimitChanges = false;
        if (response?.success === false) {
          this.errorNotice = response?.message || response?.error || 'The API did not apply due limit changes.';
          return;
        }
        this.notice = response?.message || 'Due limit changes applied successfully.';
        this.loadLimitChanges(this.pagination?.page || 1);
      },
      error: (error: any) => {
        this.isApplyingDueLimitChanges = false;
        this.errorNotice =
          (typeof error.error?.message === 'string' && error.error.message) ||
          (typeof error.error?.error === 'string' && error.error.error) ||
          (error.status === 0
            ? 'Could not reach the apply due limit changes API (network or CORS error).'
            : `Could not apply due limit changes: HTTP ${error.status}${error.statusText ? ` ${error.statusText}` : ''}.`);
      },
    });
  }

  openApplyLimitForm(row: RgRow): void {
    if (row.limitRequestId === undefined || row.limitRequestId === null || row.limitRequestId === '') {
      this.errorNotice = 'This request row does not include a limit request ID, so it cannot be applied individually.';
      return;
    }
    this.notice = '';
    this.errorNotice = '';
    this.selectedLimitRequest = row;
    this.limitChangeAction = 'apply';
    this.applyLimitReason = 'Cooling-off complete';
    this.applyLimitForce = false;
  }

  openRejectLimitForm(row: RgRow): void {
    if (row.limitRequestId === undefined || row.limitRequestId === null || row.limitRequestId === '') {
      this.errorNotice = 'This request row does not include a limit request ID, so it cannot be rejected individually.';
      return;
    }
    this.notice = '';
    this.errorNotice = '';
    this.selectedLimitRequest = row;
    this.limitChangeAction = 'reject';
    this.applyLimitReason = 'Affordability concern';
    this.applyLimitForce = false;
  }

  cancelApplyLimitForm(): void {
    this.selectedLimitRequest = null;
    this.applyLimitSubmitting = false;
  }

  submitApplyLimitChange(event: Event): void {
    event.preventDefault();
    const row = this.selectedLimitRequest;
    const reason = this.applyLimitReason.trim();
    if (row?.limitRequestId === undefined || row.limitRequestId === null || row.limitRequestId === '' || !reason || this.applyLimitSubmitting) return;

    this.applyLimitSubmitting = true;
    this.notice = '';
    this.errorNotice = '';
    const request = this.limitChangeAction === 'reject'
      ? this.admin.rejectLimitChange(row.limitRequestId, reason)
      : this.admin.applyLimitChange(row.limitRequestId, reason, this.applyLimitForce);
    request.subscribe({
      next: (response: any) => {
        this.applyLimitSubmitting = false;
        if (response?.success === false) {
          this.errorNotice = response?.message || response?.error || `The API did not ${this.limitChangeAction === 'reject' ? 'reject' : 'apply'} this limit change.`;
          return;
        }
        this.selectedLimitRequest = null;
        this.notice = response?.message || `Limit change for ${row.name} ${this.limitChangeAction === 'reject' ? 'rejected' : 'applied'} successfully.`;
        this.loadLimitChanges(this.pagination?.page || 1);
      },
      error: (error: any) => {
        this.applyLimitSubmitting = false;
        this.errorNotice =
          (typeof error.error?.message === 'string' && error.error.message) ||
          (typeof error.error?.error === 'string' && error.error.error) ||
          (error.status === 0
            ? `Could not reach the ${this.limitChangeAction === 'reject' ? 'reject' : 'apply'} limit change API (network or CORS error).`
            : `Could not ${this.limitChangeAction === 'reject' ? 'reject' : 'apply'} this limit change: HTTP ${error.status}${error.statusText ? ` ${error.statusText}` : ''}.`);
      },
    });
  }

  handleRowAction(action: string, row: RgRow): void {
    if (action.toLowerCase() === 'intervene' && this.isMonthlyLossView) {
      this.openInterventionForm(row);
      return;
    }
    this.notice = `${action} selected for ${row.name}.`;
  }

  openInterventionForm(row: RgRow): void {
    if (row.userId === undefined || row.userId === null || row.userId === '') {
      this.errorNotice = 'This user record does not include an account ID, so an intervention cannot be created.';
      return;
    }
    this.notice = '';
    this.errorNotice = '';
    this.selectedInterventionUser = row;
    this.showBulkInterventionForm = false;
    this.interventionChannel = 'notification';
    this.interventionTitle = 'Time for a break?';
    this.interventionMessage = "You've had a few tough months. Set a lower limit in Settings.";
  }

  cancelInterventionForm(): void {
    this.selectedInterventionUser = null;
    this.interventionSubmitting = false;
  }

  submitIntervention(event: Event): void {
    event.preventDefault();
    const row = this.selectedInterventionUser;
    const channel = this.interventionChannel.trim();
    const title = this.interventionTitle.trim();
    const message = this.interventionMessage.trim();
    if (row?.userId === undefined || row.userId === null || row.userId === '' || !channel || !title || !message || this.interventionSubmitting) return;

    this.interventionSubmitting = true;
    this.notice = '';
    this.errorNotice = '';
    this.admin.createIntervention({
      user_id: row.userId,
      channel,
      title,
      message,
    }).subscribe({
      next: (response: any) => {
        this.interventionSubmitting = false;
        if (response?.success === false) {
          this.errorNotice = response?.message || response?.error || 'The API did not create the intervention.';
          return;
        }
        this.selectedInterventionUser = null;
        this.notice = response?.message || `Intervention sent to ${row.name}.`;
        this.loadMonthlyLossUsers(this.pagination?.page || 1);
      },
      error: (error: any) => {
        this.interventionSubmitting = false;
        this.errorNotice =
          (typeof error.error?.message === 'string' && error.error.message) ||
          (typeof error.error?.error === 'string' && error.error.error) ||
          (error.status === 0
            ? 'Could not reach the create intervention API (network or CORS error).'
            : `Could not create intervention: HTTP ${error.status}${error.statusText ? ` ${error.statusText}` : ''}.`);
      },
    });
  }

  openBulkInterventionForm(): void {
    if (this.filteredRows.filter(row => row.userId !== undefined && row.userId !== null && row.userId !== '').length === 0) {
      this.errorNotice = 'No users with account IDs are available for a bulk intervention on this page.';
      return;
    }
    this.notice = '';
    this.errorNotice = '';
    this.selectedBulkUsers = [];
    this.selectedInterventionUser = null;
    this.bulkInterventionChannel = 'notification';
    this.bulkInterventionTitle = 'Responsible gaming check-in';
    this.bulkInterventionMessage = 'Tools to help you stay in control are in Settings.';
    this.showBulkInterventionForm = true;
  }

  isBulkUserSelected(row: RgRow): boolean {
    return this.selectedBulkUsers.some(user => String(user.userId) === String(row.userId));
  }

  toggleBulkInterventionUser(row: RgRow, checked: boolean): void {
    if (row.userId === undefined || row.userId === null || row.userId === '') return;
    this.selectedBulkUsers = checked
      ? [...this.selectedBulkUsers.filter(user => String(user.userId) !== String(row.userId)), row]
      : this.selectedBulkUsers.filter(user => String(user.userId) !== String(row.userId));
  }

  cancelBulkInterventionForm(): void {
    this.showBulkInterventionForm = false;
    this.selectedBulkUsers = [];
    this.bulkInterventionSubmitting = false;
  }

  submitBulkIntervention(event: Event): void {
    event.preventDefault();
    const userIds = this.selectedBulkUsers
      .map(user => user.userId)
      .filter((id): id is string | number => id !== undefined && id !== null && id !== '')
      .map(id => typeof id === 'string' && id.trim() !== '' && Number.isFinite(Number(id)) ? Number(id) : id);
    const channel = this.bulkInterventionChannel.trim();
    const title = this.bulkInterventionTitle.trim();
    const message = this.bulkInterventionMessage.trim();
    if (!userIds.length || !channel || !title || !message || this.bulkInterventionSubmitting) return;

    this.bulkInterventionSubmitting = true;
    this.notice = '';
    this.errorNotice = '';
    this.admin.createBulkIntervention({
      user_ids: userIds,
      channel,
      title,
      message,
    }).subscribe({
      next: (response: any) => {
        this.bulkInterventionSubmitting = false;
        if (response?.success === false) {
          this.errorNotice = response?.message || response?.error || 'The API did not create the bulk intervention.';
          return;
        }
        const selectedCount = userIds.length;
        this.showBulkInterventionForm = false;
        this.selectedBulkUsers = [];
        this.notice = response?.message || `Intervention sent to ${selectedCount} selected user${selectedCount === 1 ? '' : 's'}.`;
        this.loadMonthlyLossUsers(this.pagination?.page || 1);
      },
      error: (error: any) => {
        this.bulkInterventionSubmitting = false;
        this.errorNotice =
          (typeof error.error?.message === 'string' && error.error.message) ||
          (typeof error.error?.error === 'string' && error.error.error) ||
          (error.status === 0
            ? 'Could not reach the bulk intervention API (network or CORS error).'
            : `Could not create bulk intervention: HTTP ${error.status}${error.statusText ? ` ${error.statusText}` : ''}.`);
      },
    });
  }

  exportCsv(): void {
    const headers = ['User', 'User ID', ...this.page.columns];
    const records = this.filteredRows.map(row => [
      row.name,
      row.id,
      ...row.cells.map(cell => cell.value),
    ]);
    const escape = (value: string): string => `"${value.replace(/"/g, '""')}"`;
    const csv = [headers, ...records].map(values => values.map(escape).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.page.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  ngOnDestroy(): void {
    this.routeData?.unsubscribe();
  }
}
