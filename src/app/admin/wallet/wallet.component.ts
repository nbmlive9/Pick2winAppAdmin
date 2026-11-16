import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

type WalletView = 'operator' | 'deposits' | 'transactions' | 'user-funds' | 'inactive-funds';

interface WalletAction {
  label: string;
  primary?: boolean;
}

export interface WalletMetric {
  label: string;
  value: string;
  detail?: string;
  change?: string;
  color: string;
  spark: number[];
}

interface WalletFilter {
  key: string;
  label: string;
}

interface DepositRow {
  user: string;
  id: string;
  initials: string;
  amount: string;
  method: string;
  provider: string;
  time: string;
  kyc: string;
  fee: string;
  status: string;
  filter: string;
}

interface LedgerRow {
  id: string;
  user: string;
  uid: string;
  initials: string;
  type: string;
  amount: string;
  balance: string;
  time: string;
  reference: string;
  status: string;
  filter: string;
}

interface FundRow {
  user: string;
  id: string;
  initials: string;
  balance: string;
  bonus: string;
  withdrawal: string;
  depositDate: string;
  withdrawalDate: string;
  kyc: string;
  flag: string;
  filters: string[];
}

interface InactiveRow {
  id: string;
  balance: string;
  lastActivity: string;
  inactiveFor: string;
  notifications: number;
  due: string;
  state: 'transfer-due' | 'near-transfer' | 'monitoring';
  filter: string;
}

interface RecentTransaction {
  id: string;
  user: string;
  initials: string;
  type: string;
  method: string;
  amount: string;
  fee: string;
  net: string;
  time: string;
  status: string;
}

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css'],
})
export class WalletComponent implements OnInit, OnDestroy {
  private routeData?: Subscription;
  view: WalletView = 'operator';
  activeFilter = 'all';
  searchTerm = '';
  notice = '';

  readonly pages: Record<WalletView, { actions: WalletAction[]; filters: WalletFilter[]; metrics: WalletMetric[] }> = {
    operator: {
      actions: [
        { label: 'Range: This Month ⌄' },
        { label: 'Reconcile' },
        { label: 'Export Ledger', primary: true },
      ],
      filters: [
        { key: 'all', label: 'All' },
        { key: 'deposit', label: 'Deposits' },
        { key: 'withdrawal', label: 'Withdrawals' },
        { key: 'bonus', label: 'Bonuses' },
        { key: 'refund', label: 'Refunds' },
        { key: 'failed', label: 'Failed' },
      ],
      metrics: [],
    },
    deposits: {
      actions: [{ label: 'Export CSV' }, { label: 'PSP Report', primary: true }],
      filters: [
        { key: 'all', label: 'All' },
        { key: 'visa', label: 'Visa' },
        { key: 'mastercard', label: 'Mastercard' },
        { key: 'bank', label: 'Bank' },
        { key: 'failed', label: 'Failed' },
      ],
      metrics: [
        { label: 'Deposits Today', value: '£84,200', change: '12%', detail: '1,842 transactions', color: '#2bd4a1', spark: [62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 81, 82, 83, 84] },
        { label: 'Avg Deposit', value: '£45.72', detail: 'Visa 68% · Bank 24% · Other 8%', color: '#5b8def', spark: [38, 39, 40, 41, 42, 42, 43, 44, 44, 45, 45, 46, 46, 46] },
        { label: 'Failed (Today)', value: '42', detail: '2.3% failure rate', color: '#ff3b47', spark: [22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 40, 41, 42, 42] },
        { label: 'Processing Fees', value: '£1,684', detail: '1.99% avg · Visa £1,142 · Bank £394', color: '#ffb627', spark: [60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 82, 84, 86] },
      ],
    },
    transactions: {
      actions: [{ label: 'Export Ledger' }, { label: 'Reconciliation', primary: true }],
      filters: [
        { key: 'all', label: 'All' },
        { key: 'deposit', label: 'Deposits' },
        { key: 'withdrawal', label: 'Withdrawals' },
        { key: 'contest', label: 'Contest' },
        { key: 'bonus', label: 'Bonus' },
        { key: 'refund', label: 'Refunds' },
      ],
      metrics: [
        { label: 'Volume Today', value: '£192,480', change: '8%', detail: '4,218 transactions', color: '#2bd4a1', spark: [55, 59, 62, 66, 69, 72, 75, 78, 81, 84, 87, 90, 94, 98] },
        { label: 'Deposits', value: '£84,200', detail: '1,842 txns · 43.7%', color: '#5b8def', spark: [60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 81, 82, 84] },
        { label: 'Withdrawals', value: '£38,420', detail: '824 txns · 20.0%', color: '#ff3b47', spark: [48, 52, 54, 57, 60, 64, 67, 70, 73, 76, 80, 84, 88, 92] },
        { label: 'Contest Entry/Win', value: '£69,860', detail: '1,552 txns · 36.3%', color: '#a78bfa', spark: [50, 55, 58, 61, 64, 67, 70, 73, 76, 79, 82, 85, 88, 92] },
      ],
    },
    'user-funds': {
      actions: [{ label: 'Segregation Report' }, { label: 'Audit Trail', primary: true }],
      filters: [
        { key: 'all', label: 'All' },
        { key: 'high', label: 'High Balance' },
        { key: 'subscriber', label: 'Subscriber' },
        { key: 'student', label: 'Student' },
        { key: 'pending', label: 'Pending W/D' },
      ],
      metrics: [
        { label: 'Total User Funds', value: '£2,842,400', detail: 'segregated · Barclays client account', color: '#2bd4a1', spark: [62, 66, 69, 72, 75, 78, 81, 84, 87, 90, 92, 94, 96, 98] },
        { label: 'Active Balances', value: '£2,214,800', detail: '48,212 users · avg £45.93', color: '#5b8def', spark: [60, 64, 68, 71, 74, 77, 80, 83, 86, 89, 92, 94, 96, 98] },
        { label: 'Pending Withdrawals', value: '£482,400', detail: '1,242 requests · avg £388', color: '#ffb627', spark: [48, 54, 59, 64, 69, 73, 78, 82, 86, 89, 92, 95, 97, 98] },
        { label: 'Bonus Funds', value: '£145,200', detail: 'conditional · 14-day expiry', color: '#a78bfa', spark: [54, 58, 62, 66, 70, 74, 78, 82, 85, 88, 91, 94, 96, 98] },
      ],
    },
    'inactive-funds': {
      actions: [{ label: 'Export Schedule' }, { label: 'Send Reactivation Emails', primary: true }],
      filters: [
        { key: 'all', label: 'All' },
        { key: '12-24', label: '12–24 months' },
        { key: '2-7', label: '2–7 years' },
        { key: '7+', label: '7+ years' },
        { key: 'notified', label: 'Notified' },
      ],
      metrics: [
        { label: 'Inactive User Funds', value: '£124,820', change: '4%', detail: 'inactive >12 months', color: '#ffb627', spark: [55, 60, 64, 68, 72, 76, 80, 84, 87, 90, 93, 96, 98, 100] },
        { label: 'Due Regulatory Transfer', value: '£28,400', change: '2%', detail: 'inactive >7 years · UKGC', color: '#ff3b47', spark: [45, 52, 59, 64, 68, 72, 76, 80, 84, 87, 90, 93, 96, 99] },
        { label: 'Reminders Sent (30d)', value: '842', detail: '14.8% reactivation rate', color: '#a78bfa', spark: [50, 54, 58, 62, 66, 70, 74, 78, 82, 86, 90, 94, 97, 100] },
        { label: 'Reactivated Funds (30d)', value: '£18,420', color: '#2bd4a1', spark: [45, 50, 55, 60, 65, 69, 73, 77, 81, 85, 89, 93, 97, 100] },
      ],
    },
  };

  readonly deposits: DepositRow[] = [
    { user: 'Aaron Khouri', id: 'UK-48820', initials: 'AK', amount: '£1,000.00', method: 'Visa •••8821', provider: 'Stripe', time: '11:20', kyc: 'KYC1', fee: '£19.90', status: 'Success', filter: 'visa' },
    { user: 'Daniel Foster', id: 'UK-48291', initials: 'DF', amount: '£25.00', method: 'Visa •••4218', provider: 'Stripe', time: '11:15', kyc: 'KYC1', fee: '£0.50', status: 'Success', filter: 'visa' },
    { user: 'Sara Park', id: 'UK-49021', initials: 'SP', amount: '£50.00', method: 'Bank •••2914', provider: 'TrueLayer', time: '11:08', kyc: 'KYC1', fee: '£0.40', status: 'Success', filter: 'bank' },
    { user: 'Owen Briggs', id: 'UK-48588', initials: 'OB', amount: '£380.00', method: 'Visa •••0029', provider: 'Stripe', time: '10:55', kyc: 'KYC1', fee: '£7.56', status: 'Success', filter: 'visa' },
    { user: 'Imogen Ash', id: 'UK-48710', initials: 'IA', amount: '£20.00', method: 'Mastercard •••4481', provider: 'Stripe', time: '10:44', kyc: 'KYC0', fee: '£0.40', status: 'Success', filter: 'mastercard' },
    { user: '[Failed]', id: 'UK-49120', initials: '?', amount: '£200.00', method: 'Visa •••1122', provider: 'Stripe', time: '10:38', kyc: 'KYC0', fee: '—', status: 'Failed', filter: 'failed' },
    { user: 'Helena Moss', id: 'UK-48421', initials: 'HM', amount: '£85.00', method: 'Bank •••4118', provider: 'TrueLayer', time: '10:30', kyc: 'KYC1', fee: '£0.68', status: 'Success', filter: 'bank' },
    { user: 'Tom Whitlock', id: 'UK-48994', initials: 'TW', amount: '£3,200.00', method: 'Bank •••8742', provider: 'TrueLayer', time: '10:22', kyc: 'KYC1', fee: '£25.60', status: 'Flagged', filter: 'bank' },
  ];

  readonly ledger: LedgerRow[] = [
    { id: 'TXN-9248120', user: 'Aaron Khouri', uid: 'UK-48820', initials: 'AK', type: 'Deposit', amount: '+£1,000.00', balance: '£1,840.00', time: '11:20:14', reference: 'Stripe PI-4820x', status: 'Settled', filter: 'deposit' },
    { id: 'TXN-9248119', user: 'Daniel Foster', uid: 'UK-48291', initials: 'DF', type: 'Contest Entry', amount: '−£25.00', balance: '£1,175.00', time: '11:18:42', reference: 'CTX-ARS-LIV-1', status: 'Settled', filter: 'contest' },
    { id: 'TXN-9248118', user: 'Sara Park', uid: 'UK-49021', initials: 'SP', type: 'Contest Win', amount: '+£84.00', balance: '£284.00', time: '11:15:20', reference: 'CTX-ARS-LIV-1 · #4', status: 'Settled', filter: 'contest' },
    { id: 'TXN-9248117', user: 'Owen Briggs', uid: 'UK-48588', initials: 'OB', type: 'Withdrawal', amount: '−£380.00', balance: '£48.00', time: '11:12:08', reference: 'WD-9248117', status: 'Pending', filter: 'withdrawal' },
    { id: 'TXN-9248116', user: 'Helena Moss', uid: 'UK-48421', initials: 'HM', type: 'Deposit', amount: '+£85.00', balance: '£85.00', time: '11:08:30', reference: 'TrueLayer TL-4118', status: 'Settled', filter: 'deposit' },
    { id: 'TXN-9248115', user: 'Tom Whitlock', uid: 'UK-48994', initials: 'TW', type: 'Deposit', amount: '+£3,200.00', balance: '£3,200.00', time: '10:22:44', reference: 'TrueLayer TL-8742', status: 'Flagged', filter: 'deposit' },
    { id: 'TXN-9248114', user: 'Marcus Reed', uid: 'UK-47821', initials: 'MR', type: 'Bonus Credit', amount: '+£10.00', balance: '£410.00', time: '10:20:00', reference: 'BNS-MAY-PROMO', status: 'Settled', filter: 'bonus' },
    { id: 'TXN-9248113', user: 'Imogen Ash', uid: 'UK-48710', initials: 'IA', type: 'Contest Entry', amount: '−£5.00', balance: '£15.00', time: '10:18:22', reference: 'CTX-ARS-LIV-3', status: 'Settled', filter: 'contest' },
  ];

  readonly funds: FundRow[] = [
    { user: 'Tom Whitlock', id: 'UK-48994', initials: 'TW', balance: '£3,200.00', bonus: '£0.00', withdrawal: '£0.00', depositDate: 'May 9', withdrawalDate: '—', kyc: 'KYC1', flag: 'AML flag', filters: ['high'] },
    { user: 'Aaron Khouri', id: 'UK-48820', initials: 'AK', balance: '£1,840.00', bonus: '£0.00', withdrawal: '£1,400.00', depositDate: 'May 9', withdrawalDate: 'Apr 22', kyc: 'KYC1', flag: 'W/D pending', filters: ['high', 'pending'] },
    { user: 'Daniel Foster', id: 'UK-48291', initials: 'DF', balance: '£1,175.00', bonus: '£25.00', withdrawal: '£0.00', depositDate: 'Apr 28', withdrawalDate: 'Apr 14', kyc: 'KYC1', flag: '', filters: ['subscriber'] },
    { user: 'Marcus Reed', id: 'UK-47821', initials: 'MR', balance: '£400.00', bonus: '£10.00', withdrawal: '£0.00', depositDate: 'Apr 18', withdrawalDate: 'Mar 30', kyc: 'KYC1', flag: '', filters: [] },
    { user: 'Sara Park', id: 'UK-49021', initials: 'SP', balance: '£284.00', bonus: '£0.00', withdrawal: '£200.00', depositDate: 'May 9', withdrawalDate: 'May 2', kyc: 'KYC1', flag: '', filters: ['pending'] },
    { user: 'Imogen Ash', id: 'UK-48710', initials: 'IA', balance: '£20.00', bonus: '£0.00', withdrawal: '£0.00', depositDate: 'May 9', withdrawalDate: '—', kyc: 'KYC0', flag: '', filters: ['student'] },
    { user: 'Helena Moss', id: 'UK-48421', initials: 'HM', balance: '£85.00', bonus: '£0.00', withdrawal: '£85.00', depositDate: 'May 9', withdrawalDate: '—', kyc: 'KYC1', flag: '', filters: ['student', 'pending'] },
  ];

  readonly inactiveRows: InactiveRow[] = [
    { id: 'UK-40122', balance: '£14,200.00', lastActivity: 'Mar 2019', inactiveFor: '7y 2m', notifications: 4, due: 'Mar 2026', state: 'transfer-due', filter: '7+' },
    { id: 'UK-41088', balance: '£8,400.00', lastActivity: 'Nov 2019', inactiveFor: '6y 6m', notifications: 3, due: 'Nov 2026', state: 'near-transfer', filter: '2-7' },
    { id: 'UK-42200', balance: '£5,820.00', lastActivity: 'Jun 2020', inactiveFor: '5y 11m', notifications: 3, due: 'Jun 2027', state: 'near-transfer', filter: '2-7' },
    { id: 'UK-44100', balance: '£2,400.00', lastActivity: 'Apr 2022', inactiveFor: '4y 1m', notifications: 2, due: 'Apr 2029', state: 'monitoring', filter: '2-7' },
    { id: 'UK-45802', balance: '£1,840.00', lastActivity: 'Jan 2023', inactiveFor: '3y 4m', notifications: 2, due: 'Jan 2030', state: 'monitoring', filter: '2-7' },
    { id: 'UK-46200', balance: '£420.00', lastActivity: 'Jun 2024', inactiveFor: '23m', notifications: 1, due: 'Jun 2031', state: 'near-transfer', filter: '12-24' },
    { id: 'UK-47100', balance: '£180.00', lastActivity: 'Apr 2024', inactiveFor: '25m', notifications: 1, due: 'Apr 2031', state: 'near-transfer', filter: '2-7' },
  ];

  readonly recentTransactions: RecentTransaction[] = [
    { id: 'TX-9182AB', user: 'Daniel Foster', initials: 'DF', type: 'Deposit', method: 'Visa •••4218', amount: '£50.00', fee: '£0.78', net: '£49.22', time: '2m', status: 'Cleared' },
    { id: 'TX-9182AA', user: 'Sara Park', initials: 'SP', type: 'Withdrawal', method: 'Bank •••2914', amount: '£200.00', fee: '£0.20', net: '£199.80', time: '4m', status: 'Pending' },
    { id: 'TX-91829F', user: 'Tom Whitlock', initials: 'TW', type: 'Deposit', method: 'Mastercard •••8821', amount: '£6,200.00', fee: '£89.40', net: '£6,110.60', time: '11m', status: 'Cleared' },
    { id: 'TX-91829E', user: 'Imogen Ash', initials: 'IA', type: 'Bonus', method: 'Joining', amount: '£10.00', fee: '—', net: '£10.00', time: '14m', status: 'Cleared' },
    { id: 'TX-91829D', user: 'Owen Briggs', initials: 'OB', type: 'Withdrawal', method: 'Bank •••0029', amount: '£380.00', fee: '£0.20', net: '£379.80', time: '22m', status: 'On Hold' },
    { id: 'TX-91829C', user: 'Aaron Khouri', initials: 'AK', type: 'Deposit', method: 'Visa •••8821', amount: '£1,000.00', fee: '£14.50', net: '£985.50', time: '34m', status: 'Failed' },
  ];

  readonly dailyBars = [
    { label: 'M', value: 42, highlight: false }, { label: 'T', value: 54, highlight: false },
    { label: 'W', value: 48, highlight: false }, { label: 'T', value: 62, highlight: false },
    { label: 'F', value: 78, highlight: true }, { label: 'S', value: 84, highlight: true },
    { label: 'S', value: 62, highlight: false }, { label: 'M', value: 52, highlight: false },
    { label: 'T', value: 58, highlight: false }, { label: 'W', value: 64, highlight: false },
    { label: 'T', value: 72, highlight: false }, { label: 'F', value: 88, highlight: true },
    { label: 'S', value: 94, highlight: true }, { label: 'S', value: 68, highlight: false },
  ];
  readonly notificationDots = [0, 1, 2, 3, 4];

  readonly fundSegments = [
    { label: 'User Funds', value: '£3.84M', color: '#5b8def', size: 65.5 },
    { label: 'Operator Funds', value: '£924K', color: '#ff3b47', size: 15.8 },
    { label: 'Locked / In-play', value: '£412K', color: '#ffb627', size: 7 },
    { label: 'Withdrawable', value: '£612K', color: '#2bd4a1', size: 10.4 },
    { label: 'Dormant', value: '£68K', color: '#7a839e', size: 1.3 },
  ];

  constructor(private readonly route: ActivatedRoute) {}

  get page(): (typeof this.pages)[WalletView] {
    return this.pages[this.view];
  }

  get filteredDeposits(): DepositRow[] {
    const query = this.searchTerm.trim().toLowerCase();
    return this.deposits.filter(row =>
      (this.activeFilter === 'all' || row.filter === this.activeFilter)
      && this.matchesSearch(query, row.user, row.id, row.amount, row.method, row.provider, row.status));
  }

  get filteredLedger(): LedgerRow[] {
    const query = this.searchTerm.trim().toLowerCase();
    return this.ledger.filter(row =>
      (this.activeFilter === 'all' || row.filter === this.activeFilter)
      && this.matchesSearch(query, row.id, row.user, row.uid, row.type, row.amount, row.reference, row.status));
  }

  get filteredFunds(): FundRow[] {
    const query = this.searchTerm.trim().toLowerCase();
    return this.funds.filter(row =>
      (this.activeFilter === 'all' || row.filters.includes(this.activeFilter))
      && this.matchesSearch(query, row.user, row.id, row.balance, row.flag));
  }

  get filteredInactiveRows(): InactiveRow[] {
    const query = this.searchTerm.trim().toLowerCase();
    return this.inactiveRows.filter(row =>
      (this.activeFilter === 'all'
        || row.filter === this.activeFilter
        || (this.activeFilter === 'notified' && row.notifications > 0))
      && this.matchesSearch(query, row.id, row.balance, row.lastActivity, row.inactiveFor, row.due));
  }

  get filteredRecentTransactions(): RecentTransaction[] {
    const query = this.searchTerm.trim().toLowerCase();
    return this.recentTransactions.filter(row =>
      (this.activeFilter === 'all'
        || row.type.toLowerCase() === this.activeFilter
        || (this.activeFilter === 'failed' && row.status.toLowerCase() === 'failed'))
      && this.matchesSearch(query, row.id, row.user, row.type, row.method, row.amount, row.status));
  }

  ngOnInit(): void {
    this.routeData = this.route.data.subscribe(data => {
      const requestedView = data['view'] as WalletView | undefined;
      this.view = requestedView && requestedView in this.pages ? requestedView : 'operator';
      this.activeFilter = 'all';
      this.notice = '';
    });
  }

  setSearchTerm(value: string): void {
    this.searchTerm = value;
  }

  setFilter(key: string): void {
    this.activeFilter = key;
  }

  handleTopbarAction(index: number): void {
    const action = this.page.actions[index];
    if (action) this.notice = `${action.label.replace(/ ⌄$/, '')} selected.`;
  }

  typeTone(type: string): string {
    if (type === 'Deposit' || type === 'Contest Win') return 'green';
    if (type === 'Withdrawal') return 'red';
    if (type === 'Bonus Credit' || type === 'Bonus') return 'amber';
    if (type === 'Contest Entry') return 'violet';
    return 'blue';
  }

  trackById(_index: number, row: { id: string }): string {
    return row.id;
  }

  ngOnDestroy(): void {
    this.routeData?.unsubscribe();
  }

  private matchesSearch(query: string, ...values: string[]): boolean {
    return !query || values.some(value => value.toLowerCase().includes(query));
  }
}
