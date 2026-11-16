import { Component } from '@angular/core';

interface Withdrawal {
  id: string;
  name: string;
  initials: string;
  tier: string;
  amount: string;
  method: string;
  wait: string;
  risk: number;
  flag: string;
  checks: { kyc: 'ok' | 'missing'; aml: 'ok' | 'medium' | 'high'; balance: 'ok'; abuse: 'ok' | 'missing'; suspicious: 'ok' | 'missing' };
  filter: string;
}

@Component({
  selector: 'app-withdrawal-review',
  templateUrl: './withdrawal-review.component.html',
  styleUrls: ['./withdrawal-review.component.css'],
})
export class WithdrawalReviewComponent {
  readonly actions = [
    { label: 'Bulk Verify' },
    { label: 'Approve Selected (3)', primary: true },
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
  selectedId = 'UK-48820';
  readonly selectedIds = new Set<string>(['UK-49021', 'UK-48291', 'UK-48421']);
  readonly withdrawals: Withdrawal[] = [
    { id: 'UK-49021', name: 'Sara Park', initials: 'SP', tier: 'Other', amount: '£200.00', method: 'Bank •••2914', wait: '2h', risk: 18, flag: '', checks: { kyc: 'ok', aml: 'ok', balance: 'ok', abuse: 'ok', suspicious: 'ok' }, filter: 'auto-clear' },
    { id: 'UK-48291', name: 'Daniel Foster', initials: 'DF', tier: 'Subscriber', amount: '£200.00', method: 'Bank •••4218', wait: '3h', risk: 22, flag: '', checks: { kyc: 'ok', aml: 'ok', balance: 'ok', abuse: 'ok', suspicious: 'ok' }, filter: 'auto-clear' },
    { id: 'UK-48588', name: 'Owen Briggs', initials: 'OB', tier: 'Other', amount: '£380.00', method: 'Bank •••0029', wait: '4h', risk: 64, flag: 'Rapid W/D', checks: { kyc: 'ok', aml: 'medium', balance: 'ok', abuse: 'missing', suspicious: 'missing' }, filter: 'flagged' },
    { id: 'UK-48820', name: 'Aaron Khouri', initials: 'AK', tier: 'Other', amount: '£1,400.00', method: 'Visa •••8821', wait: '6h', risk: 92, flag: 'Multi-acct', checks: { kyc: 'ok', aml: 'high', balance: 'ok', abuse: 'missing', suspicious: 'missing' }, filter: 'flagged' },
    { id: 'UK-48421', name: 'Helena Moss', initials: 'HM', tier: 'Student', amount: '£85.00', method: 'Bank •••4118', wait: '6h', risk: 12, flag: '', checks: { kyc: 'ok', aml: 'ok', balance: 'ok', abuse: 'ok', suspicious: 'ok' }, filter: 'auto-clear' },
    { id: 'UK-48994', name: 'Tom Whitlock', initials: 'TW', tier: 'Other', amount: '£3,200.00', method: 'Bank •••8742', wait: '7h', risk: 68, flag: 'SoF £2K+', checks: { kyc: 'ok', aml: 'medium', balance: 'ok', abuse: 'ok', suspicious: 'missing' }, filter: 'flagged' },
    { id: 'UK-48710', name: 'Imogen Ash', initials: 'IA', tier: 'Student', amount: '£40.00', method: 'Bank •••0021', wait: '8h', risk: 48, flag: 'KYC stale', checks: { kyc: 'missing', aml: 'ok', balance: 'ok', abuse: 'ok', suspicious: 'ok' }, filter: 'held' },
    { id: 'UK-47821', name: 'Marcus Reed', initials: 'MR', tier: 'Other', amount: '£640.00', method: 'Bank •••3320', wait: '8h', risk: 28, flag: '', checks: { kyc: 'ok', aml: 'ok', balance: 'ok', abuse: 'ok', suspicious: 'ok' }, filter: 'auto-clear' },
  ];

  get filteredWithdrawals(): Withdrawal[] {
    const query = this.searchTerm.trim().toLowerCase();
    return this.withdrawals.filter(row =>
      (this.activeFilter === 'all' || row.filter === this.activeFilter)
      && (!query || `${row.name} ${row.id} ${row.amount} ${row.method} ${row.flag}`.toLowerCase().includes(query)));
  }

  get selectedWithdrawal(): Withdrawal {
    return this.withdrawals.find(row => row.id === this.selectedId) || this.withdrawals[3];
  }

  setSearchTerm(value: string): void {
    this.searchTerm = value;
  }

  setFilter(key: string): void {
    this.activeFilter = key;
  }

  selectWithdrawal(row: Withdrawal): void {
    this.selectedId = row.id;
  }

  toggleSelected(row: Withdrawal, event: Event): void {
    event.stopPropagation();
    if (this.selectedIds.has(row.id)) this.selectedIds.delete(row.id);
    else this.selectedIds.add(row.id);
    this.notice = `${row.name} ${this.selectedIds.has(row.id) ? 'added to' : 'removed from'} the selection.`;
    this.selectedId = row.id;
  }

  handleTopbarAction(index: number): void {
    const action = this.actions[index];
    if (action) this.notice = `${action.label} selected.`;
  }

  handleDecision(decision: string): void {
    this.notice = `${decision} selected for ${this.selectedWithdrawal.name}.`;
  }

  riskColor(score: number): string {
    return score >= 80 ? '#ff3b47' : score >= 50 ? '#ffb627' : '#2bd4a1';
  }
}
