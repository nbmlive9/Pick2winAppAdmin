import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';
import { OpsMetric } from '../shared/ops-metric-card.component';

interface BonusProgram {
  name: string;
  type: string;
  color: string;
  recipients: string;
  distributed: string;
  used: string;
  conversion: number;
  status: string;
}

interface BonusTransaction {
  id: string;
  name: string;
  usercode: string;
  tier: string;
  type: string;
  transtype: string;
  signedAmount: number;
  balanceBefore: number;
  balanceAfter: number;
  remark: string;
  referenceId: string;
  createdAt: string;
}

interface BonusPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Component({
  selector: 'app-bonuses',
  templateUrl: './bonuses.component.html',
  styleUrls: ['./bonuses.component.css'],
})
export class BonusesComponent implements OnInit {
  metrics: OpsMetric[] = [];
  programs: BonusProgram[] = [];
  transactions: BonusTransaction[] = [];
  rangeLabel = '';
  overviewLoading = false;
  overviewError = '';
  transactionsLoading = false;
  transactionsError = '';
  bonusTypeFilter = '';
  transactionTypeFilter = '';
  pagination: BonusPagination | null = null;
  abuseFlags = 0;
  abuseConfirmed = 0;
  abuseInvestigating = 0;
  private transactionRequestSequence = 0;

  private readonly programColors = ['#ff3b47', '#a78bfa', '#5b8def', '#2bd4a1', '#ffb627', '#ff6478'];

  constructor(private readonly admin: AdminService) {}

  ngOnInit(): void {
    this.loadOverview();
    this.loadTransactions(1);
  }

  loadOverview(): void {
    this.overviewLoading = true;
    this.overviewError = '';
    this.admin.getBonusOverview().subscribe({
      next: (response: any) => {
        this.overviewLoading = false;
        const data = response?.data;
        if (!data || typeof data !== 'object' || !data.kpis) {
          this.overviewError = 'The bonus overview response was not in the expected format.';
          return;
        }

        const kpis = data.kpis;
        this.rangeLabel = this.rangeText(data.range?.from, data.range?.to);
        this.abuseFlags = this.count(kpis.abuse_flags);
        this.abuseConfirmed = this.count(kpis.abuse_confirmed);
        this.abuseInvestigating = this.count(kpis.abuse_investigating);
        this.metrics = [
          {
            label: 'Bonus Distributed (MTD)',
            value: this.money(kpis.bonus_distributed),
            detail: `${this.count(kpis.bonus_recipients)} recipients · avg ${this.money(kpis.avg_bonus_per_user)}`,
            color: '#a78bfa',
          },
          {
            label: 'Active Bonus Balances',
            value: this.money(kpis.active_bonus_balances),
            detail: `${this.count(kpis.users_with_bonus)} users · ${this.money(kpis.bonus_used)} used · ${this.percent(kpis.bonus_usage_pct)} usage`,
            color: '#5b8def',
          },
          {
            label: 'Referral Conversions',
            value: this.count(kpis.referral_conversions).toLocaleString('en-GB'),
            detail: `of ${this.count(kpis.referral_invites).toLocaleString('en-GB')} invites · ${this.percent(kpis.referral_conversion_pct)}`,
            color: '#ff3b47',
          },
          {
            label: 'Abuse Flags',
            value: this.count(kpis.abuse_flags).toLocaleString('en-GB'),
            detail: `${this.count(kpis.abuse_confirmed)} confirmed · ${this.count(kpis.abuse_investigating)} investigating`,
            color: '#ffb627',
          },
        ];
        this.programs = Array.isArray(data.programs)
          ? data.programs.map((program: any, index: number) => this.mapProgram(program, index))
          : [];
      },
      error: (error: any) => {
        this.overviewLoading = false;
        this.overviewError = this.errorMessage(error, 'Could not load bonus overview');
      },
    });
  }

  loadTransactions(page = 1): void {
    const requestSequence = ++this.transactionRequestSequence;
    this.transactionsLoading = true;
    this.transactionsError = '';
    this.admin.getBonusTransactions(page, 20, this.bonusTypeFilter, this.transactionTypeFilter).subscribe({
      next: (response: any) => {
        if (requestSequence !== this.transactionRequestSequence) return;
        this.transactionsLoading = false;
        if (!Array.isArray(response?.data)) {
          this.transactions = [];
          this.pagination = null;
          this.transactionsError = 'The bonus transactions response was not in the expected format.';
          return;
        }
        this.transactions = response.data.map((item: any) => this.mapTransaction(item));
        const pagination = response.pagination ?? {};
        this.pagination = {
          total: this.count(pagination.total),
          page: Math.max(1, this.count(pagination.page) || page),
          limit: Math.max(1, this.count(pagination.limit) || 20),
          totalPages: Math.max(1, this.count(pagination.totalPages) || 1),
        };
      },
      error: (error: any) => {
        if (requestSequence !== this.transactionRequestSequence) return;
        this.transactionsLoading = false;
        this.transactions = [];
        this.pagination = null;
        this.transactionsError = this.errorMessage(error, 'Could not load bonus transactions');
      },
    });
  }

  setBonusType(value: string): void {
    this.bonusTypeFilter = value;
    this.loadTransactions(1);
  }

  setTransactionType(value: string): void {
    this.transactionTypeFilter = value;
    this.loadTransactions(1);
  }

  previousPage(): void {
    if (this.pagination && this.pagination.page > 1) this.loadTransactions(this.pagination.page - 1);
  }

  nextPage(): void {
    if (this.pagination && this.pagination.page < this.pagination.totalPages) this.loadTransactions(this.pagination.page + 1);
  }

  get pageRangeLabel(): string {
    if (!this.pagination || this.pagination.total === 0) return 'Showing 0 of 0 transactions';
    const start = (this.pagination.page - 1) * this.pagination.limit + 1;
    const end = Math.min(this.pagination.page * this.pagination.limit, this.pagination.total);
    return `Showing ${start}–${end} of ${this.pagination.total} transactions`;
  }

  money(value: unknown): string {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 2 }).format(Number(value) || 0);
  }

  signedMoney(value: number): string {
    return `${value < 0 ? '−' : '+'}${this.money(Math.abs(value))}`;
  }

  formatDate(value: string): string {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }

  transactionTone(type: string): string {
    return type.toLowerCase() === 'credit' ? 'credit' : 'debit';
  }

  private mapProgram(item: any, index: number): BonusProgram {
    const conversion = Number(item.conversion_pct ?? item.conversion ?? item.usage_pct ?? 0);
    return {
      name: String(item.name ?? item.program_name ?? item.campaign ?? item.title ?? item.bonus_type ?? 'Bonus program'),
      type: String(item.type ?? item.bonus_type ?? item.category ?? 'Other'),
      color: this.programColors[index % this.programColors.length],
      recipients: this.count(item.recipients ?? item.bonus_recipients ?? item.users ?? item.recipient_count).toLocaleString('en-GB'),
      distributed: this.money(item.distributed ?? item.bonus_distributed ?? item.amount_distributed ?? 0),
      used: this.money(item.used ?? item.bonus_used ?? item.amount_used ?? 0),
      conversion: Math.max(0, Math.min(100, conversion)),
      status: String(item.status ?? (item.active === false ? 'Inactive' : 'Active')),
    };
  }

  private mapTransaction(item: any): BonusTransaction {
    return {
      id: String(item.id ?? '—'),
      name: String(item.name ?? 'Unknown user'),
      usercode: String(item.usercode ?? item.user_id ?? '—'),
      tier: String(item.tier ?? '—'),
      type: String(item.bonus_type ?? 'Other'),
      transtype: String(item.transtype ?? 'unknown'),
      signedAmount: Number(item.signed_amount ?? (String(item.transtype).toLowerCase() === 'debit' ? -Number(item.amount) : item.amount)) || 0,
      balanceBefore: Number(item.balance_before) || 0,
      balanceAfter: Number(item.balance_after) || 0,
      remark: String(item.remark ?? '—'),
      referenceId: String(item.reference_id ?? '—'),
      createdAt: String(item.created_at ?? ''),
    };
  }

  private count(value: unknown): number {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  private percent(value: unknown): string {
    return `${this.count(value).toLocaleString('en-GB', { maximumFractionDigits: 2 })}%`;
  }

  private rangeText(from: unknown, to: unknown): string {
    if (!from && !to) return '';
    return `${from ? this.formatDate(String(from)) : '—'} – ${to ? this.formatDate(String(to)) : '—'}`;
  }

  private errorMessage(error: any, prefix: string): string {
    const detail = typeof error?.error?.message === 'string'
      ? error.error.message
      : error?.status === 0
        ? 'The API could not be reached (network or CORS error).'
        : `HTTP ${error?.status ?? 'unknown'}${error?.statusText ? ` ${error.statusText}` : ''}.`;
    return `${prefix}: ${detail}`;
  }
}
