import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';
import { OpsMetric } from '../shared/ops-metric-card.component';

@Component({
  selector: 'app-subscription-analytics',
  templateUrl: './subscription-analytics.component.html',
  styleUrls: ['./subscription-analytics.component.css'],
})
export class SubscriptionAnalyticsComponent implements OnInit {
  loading = false;
  error = '';
  page = 1;
  limit = 20;
  total = 0;
  totalPages = 0;
  filter = 'expiring';
  search = '';
  kpis: Record<string, number | null> = {};
  planMix: any[] = [];
  newVsRenewal: any = null;
  revenueMonthly: any[] = [];
  cohorts: any[] = [];
  subscribers: any[] = [];

  constructor(private readonly admin: AdminService) {}

  ngOnInit(): void { this.loadOverview(); }

  get metrics(): OpsMetric[] {
    return [
      { label: 'Total Subscribers', value: this.display(this.kpis['total_subscribers']), detail: `Active ${this.display(this.kpis['active'])} · Expired ${this.display(this.kpis['expired'])}`, color: '#a78bfa' },
      { label: 'Subscription Revenue', value: this.money(this.kpis['revenue_mtd']), detail: 'Month to date', color: '#ff3b47' },
      { label: 'Renewal Rate', value: this.percent(this.kpis['renewal_rate']), detail: `3 month plan ${this.percent(this.kpis['renewal_rate_3m'])}`, color: '#2bd4a1' },
      { label: 'Expiring (7d)', value: this.display(this.kpis['expiring_7d']), detail: `Auto-renew off ${this.display(this.kpis['expiring_auto_renew_off'])}`, color: '#ffb627' },
    ];
  }

  loadOverview(page = this.page): void {
    this.loading = true; this.error = '';
    this.admin.getSubscriptionOverview(page, this.limit, this.filter).subscribe({
      next: response => {
        const data = response?.success === false ? null : response?.data;
        this.kpis = this.numberMap(data?.kpis);
        this.planMix = Array.isArray(data?.plan_mix) ? data.plan_mix : [];
        this.newVsRenewal = data?.new_vs_renewal_mtd && typeof data.new_vs_renewal_mtd === 'object' ? data.new_vs_renewal_mtd : null;
        this.revenueMonthly = Array.isArray(data?.revenue_monthly) ? data.revenue_monthly : [];
        this.cohorts = Array.isArray(data?.cohort_retention) ? data.cohort_retention : [];
        const tracking = data?.tracking;
        this.subscribers = Array.isArray(tracking?.data) ? tracking.data : [];
        this.page = Number(tracking?.pagination?.page) || page;
        this.limit = Number(tracking?.pagination?.limit) || this.limit;
        this.total = Number(tracking?.pagination?.total) || 0;
        this.totalPages = Number(tracking?.pagination?.totalPages) || 0;
        this.loading = false;
      },
      error: () => { this.clearData(); this.error = 'Subscription data could not be loaded.'; this.loading = false; },
    });
  }

  setFilter(filter: string): void { this.filter = filter; this.page = 1; this.loadOverview(); }
  setSearch(event: Event): void { this.search = (event.target as HTMLInputElement).value; this.page = 1; this.loadTracking(); }
  loadTracking(page = this.page): void {
    this.loading = true; this.error = '';
    this.admin.getSubscriptionTracking(page, this.limit, this.filter, this.search).subscribe({
      next: response => {
        this.subscribers = Array.isArray(response?.data) ? response.data : [];
        this.page = Number(response?.pagination?.page) || page;
        this.limit = Number(response?.pagination?.limit) || this.limit;
        this.total = Number(response?.pagination?.total) || 0;
        this.totalPages = Number(response?.pagination?.totalPages) || 0;
        this.loading = false;
      },
      error: () => { this.subscribers = []; this.error = 'Subscription tracking could not be loaded.'; this.loading = false; },
    });
  }
  previousPage(): void { if (this.page > 1) this.loadTracking(this.page - 1); }
  nextPage(): void { if (this.page < this.totalPages) this.loadTracking(this.page + 1); }
  display(value: any): string { return value == null || !Number.isFinite(Number(value)) ? '—' : Number(value).toLocaleString(); }
  money(value: any): string { return value == null || !Number.isFinite(Number(value)) ? '—' : Number(value).toLocaleString(undefined, { style: 'currency', currency: 'GBP' }); }
  percent(value: any): string { return value == null || !Number.isFinite(Number(value)) ? '—' : `${Number(value)}%`; }
  initials(name: unknown): string { return String(name ?? '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase() || '—'; }
  date(value: unknown): string { const d = new Date(String(value ?? '')); return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString(); }
  private numberMap(value: any): Record<string, number | null> {
    const result: Record<string, number | null> = {};
    if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) result[key] = item == null || !Number.isFinite(Number(item)) ? null : Number(item);
    return result;
  }
  private clearData(): void { this.kpis = {}; this.planMix = []; this.newVsRenewal = null; this.revenueMonthly = []; this.cohorts = []; this.subscribers = []; this.total = 0; this.totalPages = 0; }
}
