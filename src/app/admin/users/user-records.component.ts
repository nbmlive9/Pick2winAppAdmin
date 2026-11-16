import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

type UserView = 'all' | 'students' | 'subscriptions' | 'consents' | 'deleted';
type Tone = 'positive' | 'negative' | 'warning' | 'muted' | 'blue' | 'violet';

interface Metric {
  label: string;
  value: string;
  detail: string;
  change?: string;
  color: string;
  sparkline: string;
}

interface TableCell {
  value: string;
  tone?: Tone;
  badge?: boolean;
  progress?: number;
}

interface UserRow {
  name: string;
  id: string;
  initials: string;
  cells: TableCell[];
  filters: string[];
  action?: string;
  actionTone?: Tone;
}

interface UserPage {
  title: string;
  description: string;
  metrics: Metric[];
  columns: string[];
  filters: { label: string; key: string }[];
  rows: UserRow[];
  primaryAction: string;
  secondaryAction: string;
  secondaryActionPrimary?: boolean;
}

const series = (values: number[]): string => {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  return values.map((value, index) => {
    const x = (index / (values.length - 1)) * 100;
    const y = 28 - ((value - min) / span) * 24;
    return `${x},${y.toFixed(1)}`;
  }).join(' ');
};

const metric = (
  label: string,
  value: string,
  detail: string,
  color: string,
  values: number[],
  change?: string,
): Metric => ({ label, value, detail, color, sparkline: series(values), change });

const cell = (
  value: string,
  tone?: Tone,
  badge = false,
  progress?: number,
): TableCell => ({ value, tone, badge, progress });

const row = (
  name: string,
  id: string,
  cells: TableCell[],
  filters: string[],
  action?: string,
  actionTone?: Tone,
): UserRow => ({
  name,
  id,
  initials: name.startsWith('[') ? '?' : name.split(' ').map(part => part[0]).join('').slice(0, 2),
  cells,
  filters,
  action,
  actionTone,
});

const pages: Record<UserView, UserPage> = {
  all: {
    title: 'All Users',
    description: '48,206 registered accounts · search and review user records',
    metrics: [
      metric('Total Users', '48,206', 'All registered accounts', '#a78bfa', [38000, 39100, 40500, 41800, 43100, 44600, 46200, 48206], '4.8%'),
      metric('Active Users (30d)', '38,412', '79.7% of all users', '#2bd4a1', [30000, 31600, 32800, 34100, 35600, 37000, 37900, 38412], '12.4%'),
      metric('Student Users', '12,420', '25.8% of all users', '#ffb627', [9000, 9500, 10100, 10800, 11300, 11700, 12100, 12420]),
      metric('Subscribers', '8,612', '6,420 currently active', '#5b8def', [6100, 6500, 7000, 7400, 7800, 8100, 8400, 8612]),
    ],
    columns: ['Type', 'Joined', 'Status', 'KYC', 'Last Active'],
    filters: [{ label: 'All', key: 'all' }, { label: 'Students', key: 'student' }, { label: 'Subscribers', key: 'subscriber' }, { label: 'Active', key: 'active' }],
    rows: [
      row('Daniel Foster', 'UK-48291', [cell('Subscriber', 'violet', true), cell('Sep 14, 2024'), cell('Active', 'positive', true), cell('KYC1', 'positive', true), cell('Today · 11:00')], ['subscriber', 'active'], 'View profile', 'blue'),
      row('Hannah Wells', 'UK-48211', [cell('Student', 'violet', true), cell('Jan 2026'), cell('Active', 'positive', true), cell('KYC1', 'positive', true), cell('Today · 10:42')], ['student', 'active'], 'Review', 'negative'),
      row('Sophie Lin', 'UK-47998', [cell('Student', 'violet', true), cell('Oct 2025'), cell('Active', 'positive', true), cell('KYC1', 'positive', true), cell('Today · 09:16')], ['student', 'active']),
      row('Jonas Reid', 'UK-48402', [cell('Subscriber', 'violet', true), cell('Feb 14, 2026'), cell('Active', 'positive', true), cell('KYC1', 'positive', true), cell('Yesterday')], ['subscriber', 'active']),
      row('Imogen Ash', 'UK-48710', [cell('Student', 'violet', true), cell('Apr 2026'), cell('Active', 'positive', true), cell('KYC0', 'warning', true), cell('Yesterday')], ['student', 'active']),
      row('Tom Whitlock', 'UK-48994', [cell('Standard'), cell('May 2026'), cell('Review', 'warning', true), cell('KYC0', 'warning', true), cell('May 8')], ['standard']),
      row('Helena Moss', 'UK-48421', [cell('Subscriber', 'violet', true), cell('Mar 2026'), cell('Active', 'positive', true), cell('KYC1', 'positive', true), cell('May 8')], ['subscriber', 'active']),
    ],
    primaryAction: 'Export CSV',
    secondaryAction: 'New User',
  },
  students: {
    title: 'Student Users',
    description: 'Deposit cap £500/month · sorted by risk',
    metrics: [
      metric('Total Student Users', '12,420', '25.8% of all users', '#a78bfa', [9800, 10100, 10400, 10700, 11000, 11600, 12000, 12420], '4.2%'),
      metric('At Deposit Limit', '500', '100% of £500 cap · 4%', '#ff3b47', [380, 390, 410, 430, 455, 475, 490, 500], '8%'),
      metric('Monthly Loss Flags', '142', '28.4% of at-limit students', '#ffb627', [100, 108, 112, 122, 130, 136, 140, 142], '6%'),
      metric('Self Excluded', '22', '12 active · 10 expired', '#ff3b47', [14, 15, 17, 18, 19, 20, 21, 22]),
    ],
    columns: ['Joined', 'Limit Usage', 'Total Dep.', 'Net P/L', 'Loss Months', 'KYC', 'Risk'],
    filters: [
      { label: 'All', key: 'all' }, { label: 'At Limit', key: 'at-limit' }, { label: 'Monthly Loss', key: 'monthly-loss' },
      { label: 'High Risk', key: 'high-risk' }, { label: 'Self Excl.', key: 'self-excluded' },
    ],
    rows: [
      row('Hannah Wells', 'UK-48211', [cell('Jan 2026'), cell('£500 / £500', 'negative', false, 100), cell('£2,400'), cell('−£2,400', 'negative'), cell('5 mo', 'negative', true), cell('KYC1', 'positive', true), cell('94', 'negative', false, 94)], ['at-limit', 'monthly-loss', 'high-risk'], 'Review', 'negative'),
      row('Sophie Lin', 'UK-47998', [cell('Oct 2025'), cell('£500 / £500', 'negative', false, 100), cell('£1,500'), cell('−£1,500', 'negative'), cell('3 mo', 'warning', true), cell('KYC1', 'positive', true), cell('82', 'negative', false, 82)], ['at-limit', 'monthly-loss', 'high-risk'], 'Review', 'negative'),
      row('Tara Goldsmith', 'UK-47720', [cell('Dec 2025'), cell('£500 / £500', 'negative', false, 100), cell('£1,000'), cell('−£1,000', 'negative'), cell('2 mo', 'warning', true), cell('KYC0', 'warning', true), cell('72', 'warning', false, 72)], ['at-limit', 'monthly-loss', 'high-risk'], 'Review', 'negative'),
      row('Imogen Ash', 'UK-48710', [cell('Apr 2026'), cell('£180 / £500', 'violet', false, 36), cell('£180'), cell('−£140', 'negative'), cell('1 mo', 'muted', true), cell('KYC0', 'warning', true), cell('48', 'warning', false, 48)], ['monthly-loss'], 'Monitor', 'warning'),
      row('Helena Moss', 'UK-48421', [cell('Mar 2026'), cell('£85 / £500', 'violet', false, 17), cell('£360'), cell('−£85', 'negative'), cell('0 mo', 'muted', true), cell('KYC1', 'positive', true), cell('22', 'positive', false, 22)], [], 'OK', 'positive'),
      row('Lena Park', 'UK-47812', [cell('Sep 2025'), cell('£320 / £500', 'violet', false, 64), cell('£1,200'), cell('+£240', 'positive'), cell('0 mo', 'muted', true), cell('KYC1', 'positive', true), cell('12', 'positive', false, 12)], [], 'OK', 'positive'),
      row('Jake Morton', 'UK-47401', [cell('Aug 2025'), cell('£80 / £500', 'violet', false, 16), cell('£380'), cell('+£100', 'positive'), cell('0 mo', 'muted', true), cell('KYC1', 'positive', true), cell('8', 'positive', false, 8)], [], 'OK', 'positive'),
    ],
    primaryAction: 'Export CSV',
    secondaryAction: 'Batch Review',
  },
  subscriptions: {
    title: 'Subscription Users',
    description: 'All subscribers sorted by expiry',
    metrics: [
      metric('Active Subscribers', '6,420', 'of 8,612 total · 74.5% active', '#ff3b47', [4800, 5200, 5600, 5900, 6150, 6320, 6400, 6420], '11.4%'),
      metric('1-Month Plan', '4,220', '£9.99/mo · 65.7% share', '#a78bfa', [3200, 3500, 3800, 4000, 4100, 4180, 4210, 4220]),
      metric('3-Month Plan', '2,200', '£24.99/3mo · 34.3% share', '#5b8def', [1600, 1750, 1900, 2000, 2100, 2160, 2190, 2200]),
      metric('Expiring 7d', '284', '190 auto-renew off', '#ffb627', [210, 220, 235, 250, 265, 275, 282, 284]),
    ],
    columns: ['Plan', 'Started', 'Expires', 'Auto-Renew', 'LTV', 'Contests', 'Engagement', 'Status'],
    filters: [
      { label: 'All', key: 'all' }, { label: '1 Month', key: 'one-month' }, { label: '3 Month', key: 'three-month' },
      { label: 'Expiring', key: 'expiring' }, { label: 'Expired', key: 'expired' },
    ],
    rows: [
      row('Daniel Foster', 'UK-48291', [cell('3 Month', 'violet', true), cell('Feb 9'), cell('May 9'), cell('Off', 'warning', true), cell('£74.97'), cell('184'), cell('92', 'positive', false, 92), cell('Active', 'positive', true)], ['three-month'], 'View profile', 'blue'),
      row('Jonas Reid', 'UK-48402', [cell('3 Month', 'violet', true), cell('Feb 14'), cell('May 14'), cell('On', 'positive', true), cell('£99.96'), cell('92'), cell('84', 'positive', false, 84), cell('Active', 'positive', true)], ['three-month'], 'View profile', 'blue'),
      row('Sara Park', 'UK-49021', [cell('1 Month', 'negative', true), cell('Apr 9'), cell('May 9'), cell('On', 'positive', true), cell('£29.97'), cell('44'), cell('68', 'warning', false, 68), cell('Active', 'positive', true)], ['one-month']),
      row('Marcus Reed', 'UK-47821', [cell('3 Month', 'violet', true), cell('Feb 16'), cell('May 16'), cell('Off', 'warning', true), cell('£74.97'), cell('128'), cell('72', 'positive', false, 72), cell('Active', 'positive', true)], ['three-month']),
      row('Helena Moss', 'UK-48421', [cell('1 Month', 'negative', true), cell('Apr 11'), cell('May 11 ⚠', 'warning'), cell('Off', 'warning', true), cell('£9.99'), cell('12'), cell('42', 'warning', false, 42), cell('Nudge', 'warning', true)], ['one-month', 'expiring'], 'Nudge', 'warning'),
      row('Imogen Ash', 'UK-48710', [cell('1 Month', 'negative', true), cell('Apr 14'), cell('May 14 ⚠', 'warning'), cell('Off', 'warning', true), cell('£9.99'), cell('8'), cell('28', 'negative', false, 28), cell('Nudge', 'warning', true)], ['one-month', 'expiring'], 'Nudge', 'warning'),
      row('Karl Vincent', 'UK-48109', [cell('1 Month', 'negative', true), cell('Apr 18'), cell('May 18'), cell('On', 'positive', true), cell('£19.98'), cell('62'), cell('78', 'positive', false, 78), cell('Active', 'positive', true)], ['one-month']),
    ],
    primaryAction: 'Export CSV',
    secondaryAction: 'Send Campaign',
  },
  consents: {
    title: 'Consent Logs',
    description: 'Immutable · timestamped · all consent types',
    metrics: [
      metric('T&C Consents (30d)', '4,218', 'v2.1 · current version', '#5b8def', [200, 260, 320, 380, 400, 360, 300, 240]),
      metric('Privacy Policy (30d)', '4,218', 'v2.0 · current version', '#a78bfa', [200, 260, 320, 380, 400, 360, 300, 240]),
      metric('Marketing Opt-In', '18,204', '37.8% of users opted in', '#2bd4a1', [14000, 15000, 16200, 17000, 17600, 17900, 18100, 18204]),
      metric('Pending Re-consent', '842', 'Policy v2.1 change · 7d', '#ffb627', [400, 520, 640, 720, 780, 820, 838, 842], '12%'),
    ],
    columns: ['Type', 'Version', 'Action', 'Date', 'IP', 'Device', 'Status'],
    filters: [
      { label: 'All', key: 'all' }, { label: 'T&C', key: 'terms' }, { label: 'Privacy', key: 'privacy' },
      { label: 'Marketing', key: 'marketing' }, { label: 'RG', key: 'rg' }, { label: 'AML', key: 'aml' },
    ],
    rows: [
      row('Daniel Foster', 'UK-48291', [cell('T&C', 'blue', true), cell('v2.1'), cell('Accepted', 'positive'), cell('May 9 · 10:05'), cell('88.156.42.18'), cell('Chrome · macOS'), cell('Active', 'positive', true)], ['terms']),
      row('Daniel Foster', 'UK-48291', [cell('Privacy Policy', 'violet', true), cell('v2.0'), cell('Accepted', 'positive'), cell('May 9 · 10:05'), cell('88.156.42.18'), cell('Chrome · macOS'), cell('Active', 'positive', true)], ['privacy']),
      row('Daniel Foster', 'UK-48291', [cell('Marketing', 'positive', true), cell('v1.0'), cell('Declined', 'negative'), cell('May 9 · 10:05'), cell('88.156.42.18'), cell('Chrome · macOS'), cell('Opt-out', 'muted', true)], ['marketing']),
      row('Sara Park', 'UK-49021', [cell('T&C', 'blue', true), cell('v2.1'), cell('Accepted', 'positive'), cell('May 8 · 14:22'), cell('81.130.20.4'), cell('Safari · iOS'), cell('Active', 'positive', true)], ['terms']),
      row('Sara Park', 'UK-49021', [cell('RG Policy', 'warning', true), cell('v1.4'), cell('Accepted', 'positive'), cell('May 8 · 14:22'), cell('81.130.20.4'), cell('Safari · iOS'), cell('Active', 'positive', true)], ['rg']),
      row('Aaron Khouri', 'UK-48820', [cell('T&C', 'blue', true), cell('v2.0'), cell('Accepted', 'positive'), cell('May 1 · 09:18'), cell('88.156.43.22'), cell('Chrome · Win'), cell('Active', 'positive', true)], ['terms']),
      row('Aaron Khouri', 'UK-48820', [cell('T&C', 'blue', true), cell('v2.1'), cell('Pending', 'warning'), cell('Expires May 16'), cell('—'), cell('—'), cell('Pending', 'warning', true)], ['terms', 'pending']),
      row('Helena Moss', 'UK-48421', [cell('AML Consent', 'negative', true), cell('v1.2'), cell('Accepted', 'positive'), cell('Apr 11 · 10:30'), cell('88.156.41.10'), cell('Firefox · macOS'), cell('Active', 'positive', true)], ['aml']),
    ],
    primaryAction: 'Export Audit Trail',
    secondaryAction: 'Force Re-consent',
  },
  deleted: {
    title: 'Deleted Accounts',
    description: 'GDPR-compliant · anonymised after erasure window',
    metrics: [
      metric('Deleted (30d)', '48', '38 user-requested · 10 admin', '#ff3b47', [28, 32, 36, 34, 40, 44, 46, 48]),
      metric('Total Deleted', '342', 'of 48,548 total ever', '#a78bfa', [240, 260, 280, 300, 316, 330, 338, 342]),
      metric('Data Erased', '286', '83.6% · avg 24h post-request', '#2bd4a1', [200, 224, 248, 264, 276, 282, 285, 286]),
      metric('Pending Erasure', '56', 'within 30-day GDPR window', '#ffb627', [40, 44, 48, 50, 52, 54, 55, 56]),
    ],
    columns: ['Reason', 'Requested', 'Deleted By', 'Balance at Delete', 'Erasure Due', 'Status'],
    filters: [
      { label: 'All', key: 'all' }, { label: 'User Request', key: 'user-request' }, { label: 'Admin', key: 'admin' },
      { label: 'Pending Erasure', key: 'pending-erasure' }, { label: 'Erased', key: 'erased' },
    ],
    rows: [
      row('[Redacted User]', 'UK-48102', [cell('GDPR right to erasure'), cell('May 8'), cell('User'), cell('£0.00', 'muted'), cell('Jun 7'), cell('Pending', 'warning', true)], ['user-request', 'pending-erasure']),
      row('[Redacted User]', 'UK-47820', [cell('User requested closure'), cell('May 6'), cell('User'), cell('£12.40', 'warning'), cell('Jun 5 ⚠', 'warning'), cell('Pending', 'warning', true)], ['user-request', 'pending-erasure']),
      row('Tom Whitlock', 'UK-48994', [cell('Admin — SoF non-compliance'), cell('May 1'), cell('Harman M.'), cell('£0.00', 'muted'), cell('May 31'), cell('Pending', 'warning', true)], ['admin', 'pending-erasure']),
      row('[Erased]', 'UK-47602', [cell('User requested closure'), cell('Apr 14'), cell('User'), cell('—', 'muted'), cell('May 14'), cell('Erased', 'positive', true)], ['user-request', 'erased']),
      row('[Erased]', 'UK-47580', [cell('Duplicate account'), cell('Apr 12'), cell('Mei S.'), cell('—', 'muted'), cell('May 12'), cell('Erased', 'positive', true)], ['admin', 'erased']),
      row('[Erased]', 'UK-47411', [cell('User requested closure'), cell('Apr 2'), cell('User'), cell('—', 'muted'), cell('May 2'), cell('Erased', 'positive', true)], ['user-request', 'erased']),
      row('[Erased]', 'UK-47200', [cell('Bonus abuse — closed'), cell('Mar 24'), cell('Jordan D.'), cell('—', 'muted'), cell('Apr 23'), cell('Erased', 'positive', true)], ['admin', 'erased']),
    ],
    primaryAction: 'Export GDPR Report',
    secondaryAction: 'Data Erasure Log',
    secondaryActionPrimary: false,
  },
};

@Component({
  selector: 'app-user-records',
  templateUrl: './user-records.component.html',
  styleUrls: ['./user-records.component.css'],
})
export class UserRecordsComponent implements OnInit {
  page: UserPage = pages.all;
  activeFilter = 'all';
  searchTerm = '';
  notice = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      const view = data['view'] as UserView | undefined;
      this.page = view ? pages[view] : pages.all;
      this.activeFilter = 'all';
    });
  }

  get filteredRows(): UserRow[] {
    const query = this.searchTerm.trim().toLowerCase();
    return this.page.rows.filter(record => {
      const matchesFilter = this.activeFilter === 'all' || record.filters.includes(this.activeFilter);
      const matchesSearch = !query || `${record.name} ${record.id} ${record.cells.map(item => item.value).join(' ')}`
        .toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }

  get hasActions(): boolean {
    return this.page.rows.some(record => record.action !== undefined);
  }

  setFilter(key: string): void {
    this.activeFilter = key;
  }

  setSearchTerm(value: string): void {
    this.searchTerm = value;
  }

  handleSecondaryAction(): void {
    const usefulFilter: Record<UserView, string> = {
      all: 'active',
      students: 'high-risk',
      subscriptions: 'expiring',
      consents: 'pending',
      deleted: 'pending-erasure',
    };
    const view = this.route.snapshot.data['view'] as UserView | undefined;
    const filterKey = usefulFilter[view || 'all'];
    if (this.page.filters.some(item => item.key === filterKey)) {
      this.setFilter(filterKey);
      this.notice = `Showing ${this.page.filters.find(item => item.key === filterKey)?.label.toLowerCase()} records.`;
      return;
    }
    this.notice = `${this.page.secondaryAction} is available through the connected admin service.`;
  }

  exportCsv(): void {
    const headers = ['User', 'User ID', ...this.page.columns];
    const records = this.filteredRows.map(record => [
      record.name,
      record.id,
      ...record.cells.map(item => item.value),
    ]);
    const escape = (value: string): string => `"${value.replace(/"/g, '""')}"`;
    const csv = [headers, ...records].map(values => values.map(escape).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.page.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
