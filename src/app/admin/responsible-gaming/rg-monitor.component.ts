import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/core/services/admin.service';
import { RgMetric, rgMetric } from './rg.models';

interface WatchRow {
  name: string;
  id: string;
  tier: string;
  usage: string;
  usagePercent: number;
  streak: string;
  loss: string;
  triggers: string[];
  risk: number;
  action: string;
  filters: string[];
}

interface AlertItem {
  severity: 'high' | 'medium' | 'low';
  time: string;
  message: string;
}

@Component({
  selector: 'app-rg-monitor',
  templateUrl: './rg-monitor.component.html',
  styleUrls: ['./rg-monitor.component.css'],
})
export class RgMonitorComponent implements OnInit {
  readonly primaryAction = 'RG Policy v1.4';
  readonly secondaryAction = 'Run Monthly Audit';
  metrics: RgMetric[] = [];
  lossSteps: { count: string; label: string; number: string; color: string }[] = [];
  limitTiers: {
    label: string;
    note: string;
    amount: string;
    usage: number;
    color: string;
  }[] = [];
  watchRows: WatchRow[] = [];
  highRiskSummary = { minScore: 70, total: 0 };
  highRiskPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null = null;
  highRiskLoading = true;
  highRiskNotice = '';
  alerts: AlertItem[] = [];
  limitReduction: any = null;
  limitPolicy: any = null;
  usersAtLimit = 0;
  highRiskUsers = 0;
  alertsToday = 0;
  loading = true;
  notice = '';
  overviewError = '';
  activeFilter = 'all';
  searchTerm = '';
  private highRiskLoadSequence = 0;

  readonly watchFilters = [
    { label: 'All Risk', key: 'all' },
    { label: 'Loss', key: 'loss' },
    { label: 'At Limit', key: 'at-limit' },
    { label: 'Velocity', key: 'velocity' },
    { label: 'Self-Excl', key: 'self-excl' },
  ];

  constructor(private admin: AdminService) {}

  ngOnInit(): void {
    this.loadOverview();
    this.loadHighRiskUsers(1);
  }

  loadOverview(): void {
    this.loading = true;
    this.overviewError = '';
    this.admin.getRgOverview().subscribe({
      next: (response: any) => {
        this.loading = false;
        const data = response?.data;
        if (!data || typeof data !== 'object') {
          this.showFailure('The Responsible Gaming overview response was not in the expected format.');
          return;
        }

        const kpis = data.kpis ?? {};
        const number = (value: unknown) => Number(value) || 0;
        this.usersAtLimit = number(kpis.users_at_limit);
        const studentAtLimit = number(kpis.at_limit_students);
        const otherAtLimit = Math.max(0, this.usersAtLimit - studentAtLimit);
        const lossUsers = number(kpis.monthly_loss_users);
        const consecutive = number(kpis.consecutive_2plus);
        const highRisk = number(kpis.high_risk_users);
        this.highRiskUsers = highRisk;
        const excludedActive = number(kpis.self_excluded_active);
        const excludedExpired = number(kpis.self_excluded_expired);

        this.metrics = [
          this.makeMetric(
            'Users at Limit',
            this.usersAtLimit,
            `${otherAtLimit} other · ${studentAtLimit} students`,
            '#5b8def',
          ),
          this.makeMetric(
            'Monthly Loss Users',
            lossUsers,
            `${consecutive} with 2+ consecutive months`,
            '#ffb627',
          ),
          this.makeMetric(
            'High-Risk Users',
            highRisk,
            'Users currently flagged as high risk',
            '#ff3b47',
          ),
          this.makeMetric(
            'Self Excluded',
            excludedActive + excludedExpired,
            `${excludedActive} active · ${excludedExpired} expired`,
            '#a78bfa',
          ),
        ];

        const stepColors = ['#5b8def', '#a78bfa', '#ffb627', '#ff6478', '#ff3b47'];
        this.lossSteps = (Array.isArray(data.loss_ladder) ? data.loss_ladder : []).map(
          (step: any, index: number) => ({
            count: this.formatNumber(step.users),
            label: String(step.action ?? 'No action'),
            number: String(step.months ?? index + 1),
            color: stepColors[index % stepColors.length],
          }),
        );

        this.limitReduction = data.limit_reduction ?? {};
        this.limitPolicy = this.limitReduction.policy ?? {};
        const tierColors = ['#a78bfa', '#5b8def', '#2bd4a1', '#ffb627'];
        this.limitTiers = (Array.isArray(data.limit_tiers) ? data.limit_tiers : []).map(
          (tier: any, index: number) => ({
            label: String(tier.label ?? 'User tier'),
            note: `Default · ${this.formatNumber(tier.users)} users`,
            amount: this.formatMoney(tier.default_limit),
            usage: this.clampPercent(tier.avg_usage_pct),
            color: tierColors[index % tierColors.length],
          }),
        );

        this.alertsToday = number(data.alerts?.today);
        this.alerts = (Array.isArray(data.alerts?.recent) ? data.alerts.recent : []).map(
          (alert: any): AlertItem => ({
            severity: this.alertSeverity(alert.severity ?? alert.level),
            time: this.alertTime(alert.time ?? alert.created_at ?? alert.timestamp),
            message: String(alert.message ?? alert.title ?? 'Responsible Gaming alert'),
          }),
        );
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        const detail =
          typeof error.error?.message === 'string'
            ? error.error.message
            : error.status === 0
              ? 'The API could not be reached (network or CORS error).'
              : `HTTP ${error.status}${error.statusText ? ` ${error.statusText}` : ''}.`;
        this.showFailure(`Could not load Responsible Gaming overview: ${detail}`);
      },
    });
  }

  loadHighRiskUsers(page = 1): void {
    this.highRiskLoading = true;
    this.highRiskNotice = '';
    const requestSequence = ++this.highRiskLoadSequence;
    this.admin.getHighRiskUsers(page, 20).subscribe({
      next: (response: any) => {
        if (requestSequence !== this.highRiskLoadSequence) return;
        this.highRiskLoading = false;
        if (!Array.isArray(response?.data)) {
          this.showHighRiskFailure(
            'The high-risk users response was not in the expected format.',
          );
          return;
        }

        const summary = response.summary ?? {};
        this.highRiskSummary = {
          minScore: Number(summary.min_score) || 70,
          total: Number(summary.total ?? response.pagination?.total) || 0,
        };
        this.watchRows = response.data.map((item: any): WatchRow => {
          const usedValue = item.used_this_month ?? item.used_month;
          const limitValue = item.deposit_limit ?? item.monthly_limit ?? item.default_cap;
          const rawUsage = item.limit_usage_pct ?? item.usage_pct ?? item.avg_usage_pct;
          const usagePercent = this.clampPercent(
            rawUsage ?? (Number(limitValue) > 0
              ? (Number(usedValue) / Number(limitValue)) * 100
              : 0),
          );
          const triggers = Array.isArray(item.triggers)
            ? item.triggers.map((trigger: unknown) => String(trigger))
            : [];
          const triggerText = triggers.join(' ').toLowerCase();
          const lossStreak = item.loss_streak ?? item.loss_months_12m ?? 0;
          const filters = [
            ...(Number(lossStreak) > 0 || triggerText.includes('loss') ? ['loss'] : []),
            ...(Boolean(item.at_limit) || usagePercent >= 100 || triggerText.includes('limit')
              ? ['at-limit']
              : []),
            ...(triggerText.includes('velocity') ? ['velocity'] : []),
            ...(Boolean(item.self_excluded) || triggerText.includes('self-excl')
              ? ['self-excl']
              : []),
          ];
          const usage = usedValue !== undefined && limitValue !== undefined
            ? `${this.formatMoney(usedValue)} / ${this.formatMoney(limitValue)}`
            : `${usagePercent}%`;
          return {
            name: String(item.name ?? 'Unknown user'),
            id: String(item.usercode ?? item.user_id ?? item.id ?? '—'),
            tier: String(item.tier ?? 'Other'),
            usage,
            usagePercent,
            streak: typeof lossStreak === 'string'
              ? lossStreak
              : `${this.formatNumber(lossStreak)} mo`,
            loss: this.formatMoney(item.net_loss_12m ?? item.net_loss ?? 0),
            triggers,
            risk: this.clampPercent(item.risk_score),
            action: String(item.action ?? 'Review'),
            filters,
          };
        });
        const pagination = response.pagination ?? {};
        this.highRiskPagination = {
          total: Number(pagination.total ?? this.highRiskSummary.total) || 0,
          page: Number(pagination.page) || page,
          limit: Number(pagination.limit) || 20,
          totalPages: Math.max(0, Number(pagination.totalPages) || 0),
        };
      },
      error: (error: HttpErrorResponse) => {
        if (requestSequence !== this.highRiskLoadSequence) return;
        const detail =
          typeof error.error?.message === 'string'
            ? error.error.message
            : error.status === 0
              ? 'The API could not be reached (network or CORS error).'
              : `HTTP ${error.status}${error.statusText ? ` ${error.statusText}` : ''}.`;
        this.showHighRiskFailure(`Could not load high-risk users: ${detail}`);
      },
    });
  }

  private showHighRiskFailure(message: string): void {
    this.highRiskLoading = false;
    this.highRiskNotice = message;
    this.watchRows = [];
    this.highRiskPagination = null;
  }

  previousHighRiskPage(): void {
    if (this.highRiskPagination && this.highRiskPagination.page > 1)
      this.loadHighRiskUsers(this.highRiskPagination.page - 1);
  }

  nextHighRiskPage(): void {
    if (
      this.highRiskPagination &&
      this.highRiskPagination.page < this.highRiskPagination.totalPages
    )
      this.loadHighRiskUsers(this.highRiskPagination.page + 1);
  }

  private makeMetric(label: string, value: number, detail: string, color: string): RgMetric {
    return rgMetric(label, this.formatNumber(value), detail, color, [value, value]);
  }

  private showFailure(message: string): void {
    this.loading = false;
    this.overviewError = message;
    this.metrics = [];
    this.lossSteps = [];
    this.limitTiers = [];
    this.alerts = [];
    this.usersAtLimit = 0;
    this.highRiskUsers = 0;
  }

  private alertSeverity(value: unknown): AlertItem['severity'] {
    const severity = String(value ?? 'low').toLowerCase();
    return severity === 'high' || severity === 'medium' ? severity : 'low';
  }

  private alertTime(value: unknown): string {
    if (value === null || value === undefined || value === '') return '—';
    const parsed = new Date(String(value));
    return Number.isNaN(parsed.getTime())
      ? String(value)
      : parsed.toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        });
  }

  formatNumber(value: unknown): string {
    return new Intl.NumberFormat('en-GB').format(Number(value) || 0);
  }

  formatMoney(value: unknown): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  }

  clampPercent(value: unknown): number {
    return Math.max(0, Math.min(100, Number(value) || 0));
  }

  get filteredWatchRows(): WatchRow[] {
    const query = this.searchTerm.trim().toLowerCase();
    return this.watchRows.filter((row) => {
      const filterMatch =
        this.activeFilter === 'all' || row.filters.includes(this.activeFilter);
      const queryMatch =
        !query ||
        `${row.name} ${row.id} ${row.tier} ${row.triggers.join(' ')}`
          .toLowerCase()
          .includes(query);
      return filterMatch && queryMatch;
    });
  }

  setSearchTerm(value: string): void {
    this.searchTerm = value;
  }

  setFilter(key: string): void {
    this.activeFilter = key;
  }

  handleTopbarAction(action: 'primary' | 'secondary'): void {
    this.notice = `${action === 'primary' ? this.primaryAction : this.secondaryAction} selected.`;
  }

  handleRowAction(action: string, user: string): void {
    this.notice = `${action} selected for ${user}.`;
  }

  getRiskTone(score: number): string {
    return score >= 80 ? 'risk-high' : score >= 60 ? 'risk-medium' : 'risk-low';
  }

  getInitials(name: string): string {
    return name.split(' ').map((part) => part[0]).join('').slice(0, 2);
  }
}
