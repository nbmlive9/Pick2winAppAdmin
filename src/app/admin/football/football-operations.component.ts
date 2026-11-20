import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdminService } from '../../core/services/admin.service';
import { OpsMetric } from '../shared/ops-metric-card.component';

type FootballView = 'series' | 'series-add' | 'matches' | 'match-add' | 'contest' | 'contest-add';
@Component({ selector: 'app-football-operations', templateUrl: './football-operations.component.html', styleUrls: ['./football-operations.component.css'] })
export class FootballOperationsComponent implements OnInit, OnDestroy {
  private routeSub?: Subscription;
  view: FootballView = 'series';
  loading = false; error = ''; page = 1; limit = 20; total = 0; totalPages = 0;
  status = ''; when = ''; seriesId = ''; search = '';
  summary: any = {}; series: any[] = []; matches: any[] = [];
  readonly seriesChecklist = [{ label: 'Identity & schedule', done: false }];
  readonly matchChecklist = [{ label: 'Fixture identity', done: false }];
  constructor(private readonly route: ActivatedRoute, private readonly admin: AdminService) {}
  ngOnInit(): void {
    this.routeSub = this.route.data.subscribe(data => { this.view = data['view'] ?? 'series'; if (this.view === 'series') this.loadSeries(); if (this.view === 'matches') this.loadMatches(); });
  }
  ngOnDestroy(): void { this.routeSub?.unsubscribe(); }
  get seriesMetrics(): OpsMetric[] { return [
    { label: 'Active Series', value: this.num(this.summary?.active_series), detail: 'From series overview', color: '#ff3b47' },
    { label: 'Upcoming', value: this.num(this.summary?.upcoming), detail: 'From series overview', color: '#5b8def' },
    { label: 'Total Matches', value: this.num(this.summary?.total_matches), detail: 'Across listed series', color: '#a78bfa' },
    { label: 'Total Prize Pool', value: this.money(this.summary?.total_prize_pool), detail: 'From series overview', color: '#ffb627' },
  ]; }
  get matchMetrics(): OpsMetric[] { return [
    { label: 'Live Now', value: this.num(this.summary?.live_now), detail: 'Match overview', color: '#ff3b47' },
    { label: 'Today', value: this.num(this.summary?.today), detail: 'Match overview', color: '#5b8def' },
    { label: 'This Week', value: this.num(this.summary?.this_week), detail: 'Match overview', color: '#a78bfa' },
    { label: 'Result Disputes', value: this.num(this.summary?.result_disputes), detail: 'Match overview', color: '#ffb627' },
  ]; }
  loadSeries(page = 1): void {
    this.loading = true; this.error = '';
    this.admin.getSeriesOverview(page, this.limit, this.status, this.search).subscribe({ next: r => {
      this.summary = r?.success === false ? {} : r?.summary ?? {}; this.series = Array.isArray(r?.data) ? r.data : [];
      this.acceptPage(r?.pagination, page); this.loading = false;
    }, error: () => { this.series = []; this.summary = {}; this.error = 'Series could not be loaded.'; this.loading = false; } });
  }
  loadMatches(page = 1): void {
    this.loading = true; this.error = '';
    this.admin.getMatchesOverview(page, this.limit, this.when, this.seriesId, this.search).subscribe({ next: r => {
      this.summary = r?.success === false ? {} : r?.summary ?? {}; this.matches = Array.isArray(r?.data) ? r.data : [];
      this.acceptPage(r?.pagination, page); this.loading = false;
    }, error: () => { this.matches = []; this.summary = {}; this.error = 'Matches could not be loaded.'; this.loading = false; } });
  }
  setStatus(value: string): void { this.status = value; this.loadSeries(1); }
  setWhen(value: string): void { this.when = value; this.loadMatches(1); }
  setSearch(event: Event): void { this.search = (event.target as HTMLInputElement).value; this.page = 1; this.view === 'series' ? this.loadSeries(1) : this.loadMatches(1); }
  setSeriesId(event: Event): void { this.seriesId = (event.target as HTMLInputElement).value; this.loadMatches(1); }
  previousPage(): void { if (this.page > 1) this.view === 'series' ? this.loadSeries(this.page - 1) : this.loadMatches(this.page - 1); }
  nextPage(): void { if (this.page < this.totalPages) this.view === 'series' ? this.loadSeries(this.page + 1) : this.loadMatches(this.page + 1); }
  statusLabel(value: unknown): string { return value == null || value === '' ? '—' : String(value); }
  num(value: unknown): string { return value == null || !Number.isFinite(Number(value)) ? '—' : Number(value).toLocaleString(); }
  money(value: unknown): string { return value == null || !Number.isFinite(Number(value)) ? '—' : Number(value).toLocaleString(undefined, { style: 'currency', currency: 'GBP' }); }
  dateWindow(start: unknown, end: unknown): string { const f = (v: unknown) => { const d = new Date(String(v ?? '')); return v && !Number.isNaN(d.getTime()) ? d.toLocaleDateString() : '—'; }; return `${f(start)} → ${f(end)}`; }
  matchName(match: any): string { return String(match?.match ?? ([match?.home, match?.away].filter(Boolean).join(' vs ') || '—')); }
  teamTone(_team: string): string { return '#5b8def'; }
  checklistTone(item: { done: boolean }): string { return item.done ? 'complete' : 'incomplete'; }
  private acceptPage(p: any, requested: number): void { this.page = Number(p?.page) || requested; this.limit = Number(p?.limit) || this.limit; this.total = Number(p?.total) || 0; this.totalPages = Number(p?.totalPages) || 0; }
}
