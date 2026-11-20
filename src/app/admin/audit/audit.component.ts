import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';
import { OpsMetric } from '../shared/ops-metric-card.component';

@Component({ selector: 'app-audit', templateUrl: './audit.component.html', styleUrls: ['./audit.component.css'] })
export class AuditComponent implements OnInit {
  loading = false; overviewLoading = false; error = ''; overviewError = '';
  page = 1; limit = 20; total = 0; totalPages = 0; category = ''; adminId = ''; from = ''; to = ''; search = '';
  kpis: any = {}; categories: any[] = []; roles: any[] = []; entries: any[] = [];
  constructor(private readonly admin: AdminService) {}
  ngOnInit(): void { this.loadOverview(); this.loadLogs(); }
  get metrics(): OpsMetric[] { return [
    { label: 'Admin Actions (24h)', value: this.num(this.kpis?.admin_actions_24h), detail: 'Recorded in audit overview', color: '#5b8def' },
    { label: 'Failed Logins (24h)', value: this.num(this.kpis?.failed_logins_24h), detail: `Distinct IPs: ${this.num(this.kpis?.distinct_ips_24h)}`, color: '#ffb627' },
    { label: 'Admins Total', value: this.num(this.kpis?.admins_total), detail: `Active: ${this.num(this.kpis?.admins_active)}`, color: '#2bd4a1' },
    { label: 'Admins With Failed Attempts', value: this.num(this.kpis?.admins_with_failed_attempts), detail: 'Audit overview', color: '#a78bfa' },
  ]; }
  loadOverview(): void { this.overviewLoading = true; this.overviewError = ''; this.admin.getAuditOverview(1, this.limit).subscribe({ next: r => {
    this.kpis = r?.success === false ? {} : r?.kpis ?? {}; this.categories = Array.isArray(r?.actions_by_category_24h) ? r.actions_by_category_24h : []; this.roles = Array.isArray(r?.roles) ? r.roles : []; this.overviewLoading = false;
  }, error: () => { this.kpis = {}; this.categories = []; this.roles = []; this.overviewError = 'Audit overview could not be loaded.'; this.overviewLoading = false; } }); }
  loadLogs(page = this.page): void { this.loading = true; this.error = ''; this.admin.getAuditLogs(page, this.limit, this.category, this.adminId, this.from, this.to, this.search).subscribe({ next: r => {
    this.entries = Array.isArray(r?.data) ? r.data : []; this.page = Number(r?.pagination?.page) || page; this.limit = Number(r?.pagination?.limit) || this.limit; this.total = Number(r?.pagination?.total) || 0; this.totalPages = Number(r?.pagination?.totalPages) || 0; this.loading = false;
  }, error: () => { this.entries = []; this.error = 'Audit logs could not be loaded.'; this.loading = false; } }); }
  setCategory(category: string): void { this.category = category; this.page = 1; this.loadLogs(1); }
  update(field: 'adminId' | 'from' | 'to' | 'search', event: Event): void { this[field] = (event.target as HTMLInputElement).value; this.page = 1; this.loadLogs(1); }
  previousPage(): void { if (this.page > 1) this.loadLogs(this.page - 1); }
  nextPage(): void { if (this.page < this.totalPages) this.loadLogs(this.page + 1); }
  num(v: unknown): string { return v == null || !Number.isFinite(Number(v)) ? '—' : Number(v).toLocaleString(); }
  label(v: unknown): string { return v == null || v === '' ? '—' : String(v); }
  date(v: unknown): string { const d = new Date(String(v ?? '')); return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString(); }
  initials(v: unknown): string { return String(v ?? '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase() || '—'; }
}
