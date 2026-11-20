import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';

interface ReportItem { key: string; name: string; }
interface ReportCategory { category: string; reports: ReportItem[]; }

@Component({ selector: 'app-reports', templateUrl: './reports.component.html', styleUrls: ['./reports.component.css'] })
export class ReportsComponent implements OnInit {
  loadingCatalog = false; catalogError = ''; categories: ReportCategory[] = [];
  loadingReport = false; reportError = ''; activeReport: any = null; rows: any[] = []; columns: string[] = [];
  requestedReport: ReportItem | null = null; requestedCategory = '';
  from = ''; to = '';
  private readonly colors: Record<string, string> = {
    Financial: '#5b8def', Expenses: '#ff6478', 'User & Behavior': '#a78bfa',
    Compliance: '#2bd4a1', 'Responsible Gaming': '#ff3b47', 'Bonuses & Subs': '#ffb627',
  };
  constructor(private readonly admin: AdminService) {}
  ngOnInit(): void { this.loadCatalog(); }
  loadCatalog(): void {
    this.loadingCatalog = true; this.catalogError = '';
    this.admin.getReports().subscribe({ next: response => {
      const data = response?.success === false ? null : response?.data;
      this.categories = Array.isArray(data) ? data.filter((item: any) => item && typeof item.category === 'string' && Array.isArray(item.reports))
        .map((item: any) => ({ category: item.category, reports: item.reports.filter((report: any) => report && typeof report.key === 'string' && typeof report.name === 'string') })) : [];
      this.loadingCatalog = false;
    }, error: () => { this.categories = []; this.catalogError = 'The report catalog could not be loaded.'; this.loadingCatalog = false; } });
  }
  runReport(report: ReportItem, category: string): void {
    this.requestedReport = report; this.requestedCategory = category;
    this.loadingReport = true; this.reportError = ''; this.activeReport = null; this.rows = []; this.columns = [];
    this.admin.getReport(report.key, this.from, this.to).subscribe({ next: response => {
      const data = response?.success === false ? null : response?.data;
      if (!data || typeof data !== 'object') { this.activeReport = null; this.rows = []; }
      else {
        this.activeReport = { ...data, category: data.category ?? category, key: data.key ?? report.key, name: data.name ?? report.name };
        this.rows = Array.isArray(data.rows) ? data.rows.filter((row: any) => row && typeof row === 'object' && !Array.isArray(row)) : [];
        this.columns = this.rows.reduce((keys: string[], row: any) => { Object.keys(row).forEach(key => { if (!keys.includes(key)) keys.push(key); }); return keys; }, []);
      }
      this.loadingReport = false;
    }, error: () => { this.activeReport = null; this.rows = []; this.columns = []; this.reportError = 'The selected report could not be generated.'; this.loadingReport = false; } });
  }
  retryReport(): void { if (this.requestedReport) this.runReport(this.requestedReport, this.requestedCategory); }
  color(category: string): string { return this.colors[category] ?? '#7a839e'; }
  display(value: unknown): string { if (value == null || value === '') return '—'; if (typeof value === 'object') return JSON.stringify(value); return String(value); }
  date(value: unknown): string { const d = new Date(String(value ?? '')); return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString(); }
  trackByKey(_index: number, item: ReportItem): string { return item.key; }
}
