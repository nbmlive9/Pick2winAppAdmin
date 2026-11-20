import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdminService } from 'src/app/core/services/admin.service';

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
  recordId?: string;
  transactionId?: string;
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
  balanceBefore?: string;
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
  depositBalance?: string;
  winningBalance?: string;
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
  userId?: string | number;
  user?: string;
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
  uid?: string;
  type: string;
  method: string;
  amount: string;
  balanceAfter?: string;
  reference?: string;
  fee?: string;
  net?: string;
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
  screenDescription = '';
  loading = false;
  errorNotice = '';
  showInactiveReminderForm = false;
  inactiveReminderMessage = 'You still have funds in your Pick2Win account.';
  inactiveReminderSubmitting = false;
  selectedInactiveUserIds = new Set<string>();
  pagination: { total: number; page: number; limit: number; totalPages: number } | null = null;
  operatorData: any = null;
  operatorRangeLabel = '';
  operatorRevenue = '—';
  fundCompositionTotal = '—';
  revenueStats: { label: string; value: string; negative: boolean; detail?: string }[] = [];
  fundExtraStats: { label: string; value: string }[] = [];
  private requestSequence = 0;

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

  readonly dailyBars: { label: string; depositsPct: number; withdrawalsPct: number; netPct: number }[] = [];
  readonly notificationDots = [0, 1, 2, 3, 4];

  readonly fundSegments: { label: string; value: string; color: string; size: number }[] = [];

  constructor(private readonly route: ActivatedRoute, private readonly admin: AdminService) {}

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
      this.searchTerm = '';
      this.notice = '';
      this.loadView(1);
    });
  }

  setSearchTerm(value: string): void {
    this.searchTerm = value;
    if (this.view === 'deposits' || this.view === 'user-funds') this.loadView(1);
  }

  setFilter(key: string): void {
    this.activeFilter = key;
    if (this.view === 'deposits' || this.view === 'user-funds' || this.view === 'inactive-funds') this.loadView(1);
  }

  private loadView(pageNumber: number): void {
    const sequence = ++this.requestSequence;
    this.loading = true;
    this.errorNotice = '';
    this.pagination = null;
    this.screenDescription = 'Loading records…';
    this.clearCurrentRows();
    this.pages[this.view].metrics = this.pages[this.view].metrics.map(metric => ({ ...metric, value: '—', detail: 'Loading…', spark: [] }));
    const handle = (request: any, mapResponse: (response: any) => void) => request.subscribe({
      next: (response: any) => {
        if (sequence !== this.requestSequence) return;
        this.loading = false;
        if (response?.success === false) {
          this.failLoad('The Finance & Wallet API returned an unsuccessful response.');
          return;
        }
        mapResponse(response);
      },
      error: (error: any) => {
        if (sequence !== this.requestSequence) return;
        const message = typeof error?.error?.message === 'string'
          ? error.error.message
          : error?.status === 0 ? 'The Finance & Wallet API could not be reached.' : `Could not load wallet data (HTTP ${error?.status ?? 'error'}).`;
        this.failLoad(message);
      },
    });

    if (this.view === 'operator') {
      handle(this.admin.getOperatorWallet(), response => this.applyOperatorWallet(response?.data ?? {}));
    } else if (this.view === 'deposits') {
      const status = this.activeFilter === 'failed' ? 'failed' : '';
      handle(this.admin.getDeposits(pageNumber, 20, status, '', '', '', this.searchTerm.trim()), response => this.applyDeposits(response, pageNumber));
    } else if (this.view === 'transactions') {
      handle(this.admin.getTransactions(pageNumber, 20), response => this.applyTransactions(response, pageNumber));
    } else if (this.view === 'user-funds') {
      const filter = this.activeFilter === 'all' ? '' : this.activeFilter;
      handle(this.admin.getUserFunds(pageNumber, 20, filter, 1000, this.searchTerm.trim()), response => this.applyUserFunds(response, pageNumber));
    } else {
      const months = this.activeFilter === '12-24' ? 12 : this.activeFilter === '2-7' ? 24 : this.activeFilter === '7+' ? 84 : 12;
      handle(this.admin.getInactiveFunds(pageNumber, 20, months), response => this.applyInactiveFunds(response, pageNumber));
    }
  }

  private clearCurrentRows(): void {
    if (this.view === 'operator') {
      this.recentTransactions.splice(0);
      this.dailyBars.splice(0);
      this.fundSegments.splice(0);
      this.revenueStats = [];
      this.fundExtraStats = [];
      this.operatorRangeLabel = '';
      this.operatorRevenue = '—';
      this.fundCompositionTotal = '—';
      this.fundDonutBackground = 'conic-gradient(rgba(255,255,255,.08) 0 100%)';
      this.operatorCosts = [];
      this.operatorData = null;
    } else if (this.view === 'deposits') this.deposits.splice(0);
    else if (this.view === 'transactions') this.ledger.splice(0);
    else if (this.view === 'user-funds') this.funds.splice(0);
    else this.inactiveRows.splice(0);
  }

  private failLoad(message: string): void {
    this.loading = false;
    this.errorNotice = message;
    this.screenDescription = 'Wallet data is unavailable.';
    this.pagination = null;
    this.pages[this.view].metrics = this.pages[this.view].metrics.map(metric => ({ ...metric, value: '—', detail: 'Unavailable', spark: [] }));
  }

  private applyOperatorWallet(data: any): void {
    this.operatorData = data;
    const revenue = data.revenue ?? {};
    const composition = data.fund_composition ?? {};
    this.screenDescription = `Reporting range: ${data.range?.from ?? '—'} to ${data.range?.to ?? '—'}`;
    this.operatorRangeLabel = this.screenDescription;
    this.pages.operator.actions[0].label = `Range: ${data.range?.from ?? '—'} → ${data.range?.to ?? '—'}`;
    this.operatorRevenue = this.money(revenue.net_operator_revenue);
    this.fundCompositionTotal = this.money(composition.total_user_funds);
    this.revenueStats = [
      { label: 'Platform Fees', value: this.money(revenue.platform_fees), negative: false },
      { label: 'Subscriptions', value: this.money(revenue.subscription_revenue), negative: false, detail: `${this.count(revenue.subscription_count)} purchases` },
      { label: 'Stripe Fees', value: this.money(revenue.stripe_fees), negative: true },
      { label: 'Sumsub Costs', value: this.money(revenue.sumsub_costs), negative: true },
      { label: 'Other Costs', value: this.money(revenue.other_costs), negative: true },
      { label: 'Total Costs', value: this.money(revenue.total_costs), negative: true },
      { label: 'Bonus Expense', value: this.money(revenue.bonus_expense), negative: true },
    ];
    const segments = [
      { label: 'Deposit Balances', amount: Number(composition.deposit_balances) || 0, color: '#5b8def' },
      { label: 'Winning Balances', amount: Number(composition.winning_balances) || 0, color: '#2bd4a1' },
      { label: 'Bonus Funds', amount: Number(composition.bonus_funds) || 0, color: '#a78bfa' },
      { label: 'Operator Funds', amount: Number(composition.operator_funds) || 0, color: '#ff3b47' },
    ];
    const denominator = segments.reduce((sum, item) => sum + Math.abs(item.amount), 0);
    const gradientStops: string[] = [];
    let offset = 0;
    const mappedSegments = segments.map(item => {
      const size = denominator ? Math.abs(item.amount) / denominator * 100 : 0;
      gradientStops.push(`${item.color} ${offset}% ${offset + size}%`);
      offset += size;
      return { label: item.label, value: this.money(item.amount), color: item.color, size };
    });
    this.fundSegments.splice(0, this.fundSegments.length, ...mappedSegments);
    this.fundExtraStats = [
      { label: 'Pending Withdrawals', value: `${this.money(composition.pending_withdrawals)} · ${this.count(composition.pending_withdraw_count)} requests` },
      { label: 'In Play', value: this.money(composition.in_play) },
      { label: 'Locked Total', value: this.money(composition.locked_total) },
      { label: 'Withdrawable', value: this.money(composition.withdrawable) },
      { label: 'Dormant Funds / Users', value: `${this.money(composition.dormant_funds)} / ${this.count(composition.dormant_users)}` },
    ];
    this.fundDonutBackground = `conic-gradient(${gradientStops.join(', ') || 'rgba(255,255,255,.08) 0 100%'})`;
    const flows = Array.isArray(data.daily_flow) ? data.daily_flow : [];
    const maxFlow = Math.max(1, ...flows.flatMap((item: any) => [Number(item.deposits ?? item.deposit_amount) || 0, Number(item.withdrawals ?? item.withdrawal_amount) || 0, Math.abs(Number(item.net) || 0)]));
    const bars = flows.map((item: any) => ({
      label: this.shortDate(item.date ?? item.day ?? item.created_at),
      depositsPct: Math.max(0, (Number(item.deposits ?? item.deposit ?? item.deposit_amount) || 0) / maxFlow * 100),
      withdrawalsPct: Math.max(0, (Number(item.withdrawals ?? item.withdrawal ?? item.withdrawal_amount) || 0) / maxFlow * 100),
      netPct: Math.max(0, Math.abs(Number(item.net ?? item.net_flow) || 0) / maxFlow * 100),
    }));
    this.dailyBars.splice(0, this.dailyBars.length, ...bars);
    const recent = Array.isArray(data.recent_transactions) ? data.recent_transactions : [];
    this.recentTransactions.splice(0, this.recentTransactions.length, ...recent.map((item: any) => {
      const type = this.transactionType(item.wallettype, item.transtype, item.remark);
      const signed = Number(item.signed_amount ?? item.amount) || 0;
      return {
        id: String(item.id ?? item.reference_id ?? '—'),
        user: String(item.name ?? 'Unknown user'),
        initials: this.initials(item.name),
        uid: String(item.usercode ?? item.user_id ?? '—'),
        type,
        method: String(item.wallettype ?? '—'),
        amount: this.signedMoney(signed),
        balanceAfter: this.moneyOrDash(item.balance_after),
        reference: String(item.remark ?? item.reference_id ?? '—'),
        time: item.created_at ? this.relativeTime(item.created_at) : '—',
        status: String(item.status ?? 'Recorded').replace(/^./, (letter: string) => letter.toUpperCase()),
      };
    }));
    this.screenDescription = `${this.screenDescription} · Net operator revenue ${this.money(revenue.net_operator_revenue)}`;
    const costs = Array.isArray(revenue.costs_by_category) ? revenue.costs_by_category : [];
    this.operatorCosts = costs.length
      ? costs.map((item: any) => ({ category: String(item.category ?? item.name ?? item.type ?? 'Cost'), amount: this.money(item.amount ?? item.cost ?? item.total) }))
      : [
          { category: 'Stripe fees', amount: this.money(revenue.stripe_fees) },
          { category: 'Sumsub costs', amount: this.money(revenue.sumsub_costs) },
      { category: 'Other costs', amount: this.money(revenue.other_costs) },
        ];
  }

  get fundDonutBackground(): string { return this._fundDonutBackground; }
  set fundDonutBackground(value: string) { this._fundDonutBackground = value; }
  private _fundDonutBackground = 'conic-gradient(rgba(255,255,255,.08) 0 100%)';
  operatorCosts: { category: string; amount: string }[] = [];

  get revenueLinePoints(): string {
    if (!this.dailyBars.length) return '';
    const max = Math.max(1, ...this.dailyBars.map(bar => bar.netPct));
    return this.dailyBars.map((bar, index) => {
      const x = this.dailyBars.length === 1 ? 230 : index / (this.dailyBars.length - 1) * 460;
      const y = 110 - bar.netPct / max * 90;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }

  private applyDeposits(response: any, pageNumber: number): void {
    const summary = response?.summary ?? {};
    const methodMix = Array.isArray(summary.method_split_30d)
      ? summary.method_split_30d.map((item: any) => `${item.method ?? item.name ?? 'Other'} ${Number(item.share_pct ?? item.pct) || 0}%`).join(' · ')
      : '';
    this.pages.deposits.metrics = [
      this.walletMetric('Deposits Today', this.money(summary.deposits_today), 'Deposit amount today', '#2bd4a1'),
      this.walletMetric('Transactions Today', this.count(summary.transactions_today), 'Deposit transactions today', '#5b8def'),
      this.walletMetric('Avg Deposit', this.money(summary.avg_deposit_today), methodMix || 'Average deposit today', '#a78bfa'),
      this.walletMetric('Failed Today', this.count(summary.failed_today), `${this.count(summary.failure_rate_today)}% failure rate`, '#ff3b47'),
    ];
    const rows = Array.isArray(response?.data) ? response.data : [];
    this.deposits.splice(0, this.deposits.length, ...rows.map((item: any) => ({
      recordId: String(item.id ?? item.transaction_id ?? `${item.user_id ?? 'user'}-${item.created_at ?? 'deposit'}`),
      transactionId: String(item.transaction_id ?? '—'),
      user: String(item.name ?? 'Unknown user'), id: String(item.usercode ?? item.user_id ?? item.id ?? '—'),
      initials: this.initials(item.name), amount: this.money(item.amount), method: String(item.method ?? '—'),
      provider: String(item.provider ?? item.method ?? '—'), time: item.created_at ? this.clockTime(item.created_at) : '—',
      kyc: this.kycLabel(item.kyc_status), fee: this.moneyOrDash(item.fee),
      status: item.flagged ? 'Flagged' : String(item.status ?? 'unknown').replace(/^./, (letter: string) => letter.toUpperCase()),
      filter: this.depositFilter(item.method, item.status, item.flagged),
    })));
    this.screenDescription = `${this.count(response?.pagination?.total)} deposit records · ${methodMix || 'Method split unavailable'}`;
    this.setPagination(response?.pagination, pageNumber);
  }

  private applyTransactions(response: any, pageNumber: number): void {
    const summary = response?.summary ?? {};
    const deposits = summary.deposits ?? {};
    const withdrawals = summary.withdrawals ?? {};
    const contest = summary.contest_entry_win ?? {};
    const bonuses = summary.bonuses ?? {};
    this.pages.transactions.metrics = [
      this.walletMetric('Volume Today', this.money(summary.volume_today), `${this.count(summary.transactions_today)} transactions`, '#2bd4a1'),
      this.walletMetric('Deposits', this.money(deposits.amount), `${this.count(deposits.count)} txns · ${this.count(deposits.share_pct)}%`, '#5b8def'),
      this.walletMetric('Withdrawals', this.money(withdrawals.amount), `${this.count(withdrawals.count)} txns · ${this.count(withdrawals.share_pct)}%`, '#ff3b47'),
      this.walletMetric('Contest Entry/Win', this.money(contest.amount), `${this.count(contest.count)} txns · ${this.count(contest.share_pct)}% · bonuses ${this.money(bonuses.amount)}`, '#a78bfa'),
    ];
    const rows = Array.isArray(response?.data) ? response.data : [];
    this.ledger.splice(0, this.ledger.length, ...rows.map((item: any) => {
      const type = this.transactionType(item.wallettype, item.transtype, item.remark);
      const signed = Number(item.signed_amount ?? item.amount) || 0;
      return {
        id: String(item.id ?? '—'), user: String(item.name ?? 'Unknown user'), uid: String(item.usercode ?? item.user_id ?? '—'),
        initials: this.initials(item.name), type, amount: this.signedMoney(signed),
        balanceBefore: this.moneyOrDash(item.balance_before), balance: this.moneyOrDash(item.balance_after), time: item.created_at ? this.clockTime(item.created_at) : '—',
        reference: String(item.remark ?? item.reference_id ?? '—'),
        status: String(item.status ?? (item.transtype === 'debit' || item.transtype === 'credit' ? 'Settled' : 'Recorded')).replace(/^./, (letter: string) => letter.toUpperCase()),
        filter: this.transactionFilter(item.wallettype, item.transtype, type),
      };
    }));
    this.screenDescription = `${this.count(response?.pagination?.total)} ledger records · ${Array.isArray(summary.by_type) ? summary.by_type.length : 0} transaction categories`;
    this.setPagination(response?.pagination, pageNumber);
  }

  private applyUserFunds(response: any, pageNumber: number): void {
    const summary = response?.summary ?? {};
    this.pages['user-funds'].metrics = [
      this.walletMetric('Total User Funds', this.money(summary.total_user_funds), 'Combined customer balances', '#2bd4a1'),
      this.walletMetric('Active Balances', this.count(summary.active_balances), `Average ${this.money(summary.avg_balance)}`, '#5b8def'),
      this.walletMetric('Pending Withdrawals', this.money(summary.pending_withdrawals), `${this.count(summary.pending_withdraw_count)} requests`, '#ffb627'),
      this.walletMetric('Bonus Funds', this.money(summary.bonus_funds), 'Bonus balances held by users', '#a78bfa'),
    ];
    const rows = Array.isArray(response?.data) ? response.data : [];
    this.funds.splice(0, this.funds.length, ...rows.map((item: any) => {
      const pending = Number(item.pending_withdrawal) || 0;
      return {
        user: String(item.name ?? 'Unknown user'), id: String(item.usercode ?? item.user_id ?? '—'), initials: this.initials(item.name),
        balance: this.money(item.balance), depositBalance: this.money(item.deposit_balance), winningBalance: this.money(item.winning_balance), bonus: this.money(item.bonus_balance), withdrawal: this.money(pending),
        depositDate: item.last_deposit_at ? this.shortDate(item.last_deposit_at) : '—',
        withdrawalDate: item.last_withdrawal_at ? this.shortDate(item.last_withdrawal_at) : '—',
        kyc: this.kycLabel(item.kyc_status), flag: String(item.flag ?? ''),
        filters: [String(item.tier ?? '').toLowerCase(), ...(pending > 0 ? ['pending'] : []), ...(Number(item.balance) >= 1000 ? ['high'] : [])],
      };
    }));
    this.screenDescription = `${this.count(response?.pagination?.total)} user balances · minimum balance ${this.money(1000)}`;
    this.setPagination(response?.pagination, pageNumber);
  }

  private applyInactiveFunds(response: any, pageNumber: number): void {
    const summary = response?.summary ?? {};
    this.pages['inactive-funds'].metrics = [
      this.walletMetric('Inactive User Funds', this.money(summary.inactive_user_funds), `${this.count(summary.inactive_users)} users · inactive ${this.count(summary.inactive_months)}+ months`, '#ffb627'),
      this.walletMetric('Due Regulatory Transfer', this.money(summary.due_regulatory_transfer), 'Funds due for regulatory transfer', '#ff3b47'),
      this.walletMetric('Reminders Sent (30d)', this.count(summary.reminders_sent_30d), 'Reminder notifications in the last 30 days', '#a78bfa'),
      this.walletMetric('Inactive Users', this.count(summary.inactive_users), `${this.count(summary.inactive_months)} month inactivity threshold`, '#5b8def'),
    ];
    const rows = Array.isArray(response?.data) ? response.data : [];
    this.inactiveRows.splice(0, this.inactiveRows.length, ...rows.map((item: any) => {
      const monthsInactive = Number(item.inactive_months ?? item.months_inactive) || 0;
      const due = Boolean(item.transfer_due ?? item.due_regulatory_transfer ?? monthsInactive >= 84);
      const state: InactiveRow['state'] = due ? 'transfer-due' : monthsInactive >= 72 ? 'near-transfer' : 'monitoring';
      return {
        id: String(item.usercode ?? item.user_id ?? item.id ?? '—'), user: String(item.name ?? '[Unclaimed]'), balance: this.money(item.balance ?? item.inactive_balance),
        userId: item.user_id ?? item.userid ?? item.id,
        lastActivity: (item.last_activity_at ?? item.last_activity) ? this.shortDate(item.last_activity_at ?? item.last_activity) : '—',
        inactiveFor: monthsInactive ? `${Math.floor(monthsInactive / 12)}y ${monthsInactive % 12}m` : '—',
        notifications: Number(item.reminders_sent ?? item.notifications_sent) || 0,
        due: item.transfer_due_at ? this.shortDate(item.transfer_due_at) : '—', state,
        filter: monthsInactive >= 84 ? '7+' : monthsInactive >= 24 ? '2-7' : '12-24',
      };
    }));
    this.screenDescription = `${this.count(response?.pagination?.total)} inactive accounts · threshold ${this.count(summary.inactive_months)} months`;
    this.setPagination(response?.pagination, pageNumber);
  }

  private walletMetric(label: string, value: string, detail: string, color: string): WalletMetric {
    return { label, value, detail, color, spark: [] };
  }

  private setPagination(paging: any, requestedPage: number): void {
    if (!paging) { this.pagination = null; return; }
    this.pagination = { total: Number(paging.total) || 0, page: Number(paging.page) || requestedPage, limit: Number(paging.limit) || 20, totalPages: Math.max(1, Number(paging.totalPages) || 1) };
  }

  get pageRangeLabel(): string {
    if (!this.pagination || !this.pagination.total) return 'Showing 0 of 0 records';
    const start = (this.pagination.page - 1) * this.pagination.limit + 1;
    const end = Math.min(this.pagination.page * this.pagination.limit, this.pagination.total);
    return `Showing ${start}–${end} of ${this.pagination.total} records`;
  }

  private count(value: any): string { return new Intl.NumberFormat('en-GB').format(Number(value) || 0); }
  private money(value: any): string { return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 2 }).format(Number(value) || 0); }
  private moneyOrDash(value: any): string { return value === null || value === undefined ? '—' : this.money(value); }
  private initials(name: any): string { const text = String(name ?? ''); return text ? text.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase() : '?'; }
  private kycLabel(value: any): string {
    const status = String(value ?? '').toLowerCase();
    return ['approved', 'passed', 'complete', 'completed'].includes(status) ? 'Approved'
      : status === 'not_started' ? 'Not Started'
        : status === 'pending' ? 'Pending'
        : status ? status.replace(/_/g, ' ').replace(/^./, letter => letter.toUpperCase()) : 'Unknown';
  }
  private shortDate(value: any): string { const date = new Date(String(value)); return Number.isNaN(date.getTime()) ? String(value ?? '—') : new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date); }
  private clockTime(value: any): string { const date = new Date(String(value)); return Number.isNaN(date.getTime()) ? String(value ?? '—') : new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(date); }
  private relativeTime(value: any): string { const minutes = Math.max(0, Math.floor((Date.now() - new Date(String(value)).getTime()) / 60000)); return !Number.isFinite(minutes) ? '—' : minutes < 60 ? `${minutes}m` : minutes < 1440 ? `${Math.floor(minutes / 60)}h` : `${Math.floor(minutes / 1440)}d`; }
  private signedMoney(value: number): string { return `${value >= 0 ? '+' : '−'}${this.money(Math.abs(value))}`; }
  private transactionType(walletType: any, transactionType: any, remark: any): string {
    const wallet = String(walletType ?? '').toLowerCase();
    if (wallet === 'deposit') return 'Deposit';
    if (wallet === 'withdrawal') return 'Withdrawal';
    if (wallet === 'bonus') return 'Bonus';
    if (wallet === 'winning') return String(transactionType).toLowerCase() === 'credit' ? 'Contest Win' : 'Contest Entry';
    if (wallet === 'subscribe') return 'Subscription';
    if (wallet === 'refund') return 'Refund';
    return String(remark ?? walletType ?? 'Transaction');
  }
  private transactionFilter(walletType: any, transactionType: any, type: string): string {
    const wallet = String(walletType ?? '').toLowerCase();
    if (wallet === 'deposit' || wallet === 'withdrawal' || wallet === 'bonus' || wallet === 'refund') return wallet;
    if (wallet === 'winning') return 'contest';
    return String(transactionType).toLowerCase() === 'debit' ? 'withdrawal' : type.toLowerCase();
  }
  private depositFilter(method: any, status: any, flagged: boolean): string {
    if (flagged) return 'failed';
    if (String(status).toLowerCase() !== 'success') return String(status ?? '').toLowerCase();
    const value = String(method ?? '').toLowerCase();
    return value.includes('visa') ? 'visa' : value.includes('master') ? 'mastercard' : value.includes('bank') || value.includes('transfer') ? 'bank' : 'all';
  }

  previousPage(): void { if (this.pagination && this.pagination.page > 1) this.loadView(this.pagination.page - 1); }
  nextPage(): void { if (this.pagination && this.pagination.page < this.pagination.totalPages) this.loadView(this.pagination.page + 1); }

  handleTopbarAction(index: number): void {
    const action = this.page.actions[index];
    if (this.view === 'inactive-funds' && index === 1) { this.openInactiveReminder(); return; }
    if (action) this.notice = `${action.label.replace(/ ⌄$/, '')} selected.`;
  }

  toggleInactiveUser(row: InactiveRow): void {
    if (row.userId == null) return;
    const id = String(row.userId);
    if (this.selectedInactiveUserIds.has(id)) this.selectedInactiveUserIds.delete(id);
    else this.selectedInactiveUserIds.add(id);
  }

  openInactiveReminder(row?: InactiveRow): void {
    this.notice = '';
    this.errorNotice = '';
    if (row) {
      if (row.userId == null) { this.errorNotice = 'This account does not have a user ID for the reminder request.'; return; }
      this.selectedInactiveUserIds = new Set([String(row.userId)]);
    } else if (this.selectedInactiveUserIds.size === 0) {
      this.errorNotice = 'Select at least one account before sending a reminder.';
      return;
    }
    this.showInactiveReminderForm = true;
  }

  submitInactiveReminder(): void {
    if (this.inactiveReminderSubmitting) return;
    const message = this.inactiveReminderMessage.trim();
    const userIds = [...this.selectedInactiveUserIds].map(id => /^\d+$/.test(id) ? Number(id) : id);
    if (!userIds.length || !message) { this.errorNotice = 'Select one or more accounts and enter a reminder message.'; return; }
    this.inactiveReminderSubmitting = true;
    this.errorNotice = '';
    this.notice = '';
    this.admin.sendInactiveReminders(userIds, message).subscribe({
      next: response => {
        this.inactiveReminderSubmitting = false;
        if (response?.success === false) { this.errorNotice = response.message || 'Could not send inactive-account reminders.'; return; }
        this.notice = response?.message || `Reminder sent to ${userIds.length} account${userIds.length === 1 ? '' : 's'}.`;
        this.showInactiveReminderForm = false;
        this.selectedInactiveUserIds.clear();
        this.loadView(this.pagination?.page ?? 1);
      },
      error: error => {
        this.inactiveReminderSubmitting = false;
        this.errorNotice = error?.error?.message || (error?.status === 0 ? 'The Wallet API could not be reached.' : `Reminder request failed (HTTP ${error?.status ?? 'error'}).`);
      },
    });
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

  trackByDeposit(_index: number, row: DepositRow): string { return row.recordId ?? row.id; }

  ngOnDestroy(): void {
    this.routeData?.unsubscribe();
  }

  private matchesSearch(query: string, ...values: string[]): boolean {
    return !query || values.some(value => value.toLowerCase().includes(query));
  }
}
