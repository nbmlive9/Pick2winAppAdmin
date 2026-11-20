import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminService } from '../../core/services/admin.service';

interface Withdrawal {
  id: string;
  userId: number | string;
  usercode: string;
  name: string;
  initials: string;
  tier: string;
  amount: number;
  method: string;
  requestedAt: string;
  waitHours: number;
  risk: number;
  flags: string[];
  held: boolean;
  checks: { kyc: boolean; aml: string; balance: boolean; abuse: boolean; suspicious: boolean };
}

@Component({
  selector: 'app-withdrawal-review',
  templateUrl: './withdrawal-review.component.html',
  styleUrls: ['./withdrawal-review.component.css'],
})
export class WithdrawalReviewComponent implements OnInit {
  readonly actions = [
    { label: 'Bulk Verify' },
    { label: 'Approve Selected', primary: true },
  ];
  readonly filters = [
    { key: 'all', label: 'All' },
    { key: 'flagged', label: 'Flagged' },
    { key: 'held', label: 'Held' },
    { key: 'auto-clear', label: 'Auto-clear' },
  ];
  activeFilter = 'all';
  searchTerm = '';
  notice = '';
  error = '';
  withdrawalNote = '';
  verificationMessage = '';
  showVerificationForm = false;
  actionSubmitting = false;
  loading = false;
  detailLoading = false;
  selectedId = '';
  selectedIds = new Set<string>();
  withdrawals: Withdrawal[] = [];
  summary: any = { pending: 0, pending_amount: 0, flagged: 0, held: 0, auto_clear: 0 };
  detail: any = null;
  page = 1;
  limit = 20;
  total = 0;
  totalPages = 0;

  constructor(private admin: AdminService) {}

  ngOnInit(): void { this.loadQueue(); }

  get filteredWithdrawals(): Withdrawal[] {
    const query = this.searchTerm.trim().toLowerCase();
    return this.withdrawals.filter(row => {
      const matchesFilter = this.activeFilter === 'all'
        || (this.activeFilter === 'flagged' && row.flags.length > 0)
        || (this.activeFilter === 'held' && row.held)
        || (this.activeFilter === 'auto-clear' && !row.held && row.flags.length === 0 && this.checksPass(row.checks));
      return matchesFilter && (!query || `${row.name} ${row.id} ${row.userId} ${row.usercode} ${row.tier} ${row.method} ${row.flags.join(' ')}`.toLowerCase().includes(query));
    });
  }

  get selectedWithdrawal(): Withdrawal | null {
    return this.withdrawals.find(row => row.id === this.selectedId) ?? null;
  }

  get activity(): any[] { return this.detail?.recent_activity ?? []; }

  loadQueue(): void {
    this.loading = true;
    this.error = '';
    this.admin.getWithdrawalQueue(this.page, this.limit).subscribe({
      next: response => {
        const rows = Array.isArray(response?.data) ? response.data : [];
        this.summary = response?.summary ?? this.summary;
        this.withdrawals = rows.map((item: any) => this.mapWithdrawal(item));
        this.total = Number(response?.pagination?.total) || 0;
        this.page = Number(response?.pagination?.page) || this.page;
        this.limit = Number(response?.pagination?.limit) || this.limit;
        this.totalPages = Number(response?.pagination?.totalPages) || 0;
        if (!this.withdrawals.some(row => row.id === this.selectedId)) {
          this.selectedId = this.withdrawals[0]?.id ?? '';
          this.detail = null;
          if (this.selectedId) this.loadReview(this.selectedId);
        }
        this.loading = false;
      },
      error: () => { this.error = 'Unable to load the withdrawal queue.'; this.loading = false; },
    });
  }

  private mapWithdrawal(item: any): Withdrawal {
    const checks = item?.checks ?? {};
    return {
      id: String(item?.withdraw_id ?? ''), userId: item?.user_id ?? '—', usercode: String(item?.usercode ?? ''),
      name: String(item?.name ?? 'Unknown user'), initials: this.initials(item?.name), tier: String(item?.tier ?? '—'),
      amount: Number(item?.amount) || 0, method: String(item?.method ?? '—'), requestedAt: String(item?.requested_at ?? ''),
      waitHours: Number(item?.wait_hours) || 0, risk: Number(item?.risk_score) || 0,
      flags: Array.isArray(item?.flags) ? item.flags.map((flag: any) => typeof flag === 'string' ? flag : flag?.label ?? flag?.code ?? JSON.stringify(flag)) : [],
      held: Boolean(item?.is_held), checks: { kyc: checks.kyc === true, aml: String(checks.aml ?? 'unknown'), balance: checks.bal === true, abuse: checks.abuse === true, suspicious: checks.susp === true },
    };
  }

  private initials(name: any): string {
    return String(name ?? '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part: string) => part[0]).join('').toUpperCase() || '?';
  }

  private checksPass(checks: Withdrawal['checks']): boolean {
    return checks.kyc && checks.balance && checks.abuse && checks.suspicious && checks.aml.toLowerCase() === 'low';
  }

  loadReview(withdrawId: string): void {
    this.detailLoading = true;
    this.detail = null;
    this.admin.getWithdrawalReview(withdrawId).subscribe({
      next: response => { this.detail = response?.data ?? null; this.detailLoading = false; },
      error: () => { this.error = 'Unable to load withdrawal review details.'; this.detailLoading = false; },
    });
  }

  setSearchTerm(value: string): void { this.searchTerm = value; }
  setFilter(key: string): void { this.activeFilter = key; }

  selectWithdrawal(row: Withdrawal): void {
    if (this.selectedId === row.id && this.detail) return;
    this.selectedId = row.id;
    this.withdrawalNote = '';
    this.verificationMessage = '';
    this.showVerificationForm = false;
    this.loadReview(row.id);
  }

  toggleSelected(row: Withdrawal, event: Event): void {
    event.stopPropagation();
    if (this.selectedIds.has(row.id)) this.selectedIds.delete(row.id);
    else this.selectedIds.add(row.id);
    this.selectedId = row.id;
    this.loadReview(row.id);
  }

  changePage(page: number): void {
    if (page < 1 || (this.totalPages && page > this.totalPages)) return;
    this.page = page;
    this.loadQueue();
  }

  formatMoney(value: any): string {
    const amount = Number(value);
    return Number.isFinite(amount) ? new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount) : '—';
  }

  formatDate(value: any): string {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
  }

  formatWait(hours: number): string {
    if (!Number.isFinite(hours)) return '—';
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    return days ? `${days}d ${remainingHours}h` : `${remainingHours}h`;
  }

  riskColor(score: number): string { return score >= 80 ? '#ff3b47' : score >= 50 ? '#ffb627' : '#2bd4a1'; }
  amlClass(value: string): string { return value.toLowerCase() === 'low' ? 'pip-ok' : value.toLowerCase() === 'medium' ? 'pip-warn' : 'pip-bad'; }

  handleTopbarAction(index: number): void {
    const action = this.actions[index];
    if (!action) return;
    this.notice = `${action.label} is not available until a withdrawal action endpoint is provided.`;
  }

  holdSelectedWithdrawal(): void {
    const note = this.withdrawalNote.trim();
    if (!note) { this.error = 'Enter a note before holding this withdrawal.'; return; }
    this.runAction(this.admin.holdWithdrawal(this.selectedId, note), 'Withdrawal put on hold.');
  }

  releaseSelectedWithdrawal(): void {
    const note = this.withdrawalNote.trim();
    if (!note) { this.error = 'Enter a note before releasing this withdrawal.'; return; }
    this.runAction(this.admin.releaseWithdrawal(this.selectedId, note), 'Withdrawal released.');
  }

  addSelectedWithdrawalNote(): void {
    const note = this.withdrawalNote.trim();
    if (!note) { this.error = 'Enter a note to add to this withdrawal.'; return; }
    this.runAction(this.admin.addWithdrawalNote(this.selectedId, note), 'Withdrawal note added.');
  }

  submitVerificationRequest(): void {
    const message = this.verificationMessage.trim();
    if (!message) { this.error = 'Enter a message for the verification request.'; return; }
    this.runAction(this.admin.requestWithdrawalVerification(this.selectedId, message), 'Verification request sent.');
  }

  private runAction(request: Observable<any>, successMessage: string): void {
    if (!this.selectedId || this.actionSubmitting) return;
    this.actionSubmitting = true;
    this.error = '';
    this.notice = '';
    request.subscribe({
      next: response => {
        this.actionSubmitting = false;
        if (response?.success === false) { this.error = response.message || 'The withdrawal action was not completed.'; return; }
        this.notice = response?.message || successMessage;
        this.showVerificationForm = false;
        this.withdrawalNote = '';
        this.verificationMessage = '';
        this.loadQueue();
        this.loadReview(this.selectedId);
      },
      error: error => {
        this.actionSubmitting = false;
        this.error = error?.error?.message || (error?.status === 0 ? 'The Wallet API could not be reached.' : `Withdrawal action failed (HTTP ${error?.status ?? 'error'}).`);
      },
    });
  }
}
