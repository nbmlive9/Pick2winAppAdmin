import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';

@Component({ selector: 'app-support-tickets', templateUrl: './support-tickets.component.html', styleUrls: ['./support-tickets.component.css'] })
export class SupportTicketsComponent implements OnInit {
  loading = false; detailLoading = false; error = ''; detailError = '';
  page = 1; limit = 20; total = 0; totalPages = 0; filter = ''; category = ''; priority = ''; search = '';
  summary: any = {}; tickets: any[] = []; selectedId: string | null = null; detail: any = null;
  constructor(private readonly admin: AdminService) {}
  ngOnInit(): void { this.loadTickets(); }
  loadTickets(page = this.page): void {
    this.loading = true; this.error = '';
    this.admin.getSupportTickets(page, this.limit, this.filter, this.category, this.priority, this.search).subscribe({ next: r => {
      this.summary = r?.success === false ? {} : r?.summary ?? {}; this.tickets = Array.isArray(r?.data) ? r.data : [];
      this.page = Number(r?.pagination?.page) || page; this.limit = Number(r?.pagination?.limit) || this.limit;
      this.total = Number(r?.pagination?.total) || 0; this.totalPages = Number(r?.pagination?.totalPages) || 0; this.loading = false;
      if (!this.tickets.some(t => String(t?.id) === this.selectedId)) { this.detail = null; this.selectedId = null; if (this.tickets[0]?.id != null) this.selectTicket(this.tickets[0].id); }
    }, error: () => { this.tickets = []; this.summary = {}; this.detail = null; this.error = 'Support tickets could not be loaded.'; this.loading = false; } });
  }
  selectTicket(id: string | number): void {
    this.selectedId = String(id); this.detailLoading = true; this.detailError = '';
    this.admin.getSupportTicketById(id).subscribe({ next: r => { const d = r?.success === false ? null : r?.data; this.detail = d && typeof d === 'object' ? d : null; this.detailLoading = false; }, error: () => { this.detail = null; this.detailError = 'Ticket details could not be loaded.'; this.detailLoading = false; } });
  }
  setFilter(filter: string): void { this.filter = filter; this.page = 1; this.loadTickets(1); }
  setCategory(category: string): void { this.category = category; this.page = 1; this.loadTickets(1); }
  setPriority(priority: string): void { this.priority = priority; this.page = 1; this.loadTickets(1); }
  setSearch(event: Event): void { this.search = (event.target as HTMLInputElement).value; this.page = 1; this.loadTickets(1); }
  previousPage(): void { if (this.page > 1) this.loadTickets(this.page - 1); }
  nextPage(): void { if (this.page < this.totalPages) this.loadTickets(this.page + 1); }
  initials(name: unknown): string { return String(name ?? '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase() || '—'; }
  isSelected(id: unknown): boolean { return String(id ?? '') === this.selectedId; }
  retryDetail(): void { if (this.selectedId) this.selectTicket(this.selectedId); }
  label(value: unknown): string { return value == null || value === '' ? '—' : String(value); }
  date(value: unknown): string { const d = new Date(String(value ?? '')); return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString(); }
}
