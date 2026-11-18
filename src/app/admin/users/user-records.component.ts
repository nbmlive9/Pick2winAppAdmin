import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from 'src/app/core/services/admin.service';

type UserView = 'all' | 'students' | 'subscriptions' | 'consents' | 'deleted';
type Tone = 'positive' | 'negative' | 'warning' | 'muted' | 'blue' | 'violet';

interface Metric {
  label: string;
  value: string;
  detail: string;
  change?: string;
  color: string;
  sparkline?: string;
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
  profileUserId?: string | number;
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
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 28 - ((value - min) / span) * 24;
      return `${x},${y.toFixed(1)}`;
    })
    .join(' ');
};

const metric = (
  label: string,
  value: string,
  detail: string,
  color: string,
  values?: number[],
  change?: string,
): Metric => ({
  label,
  value,
  detail,
  color,
  sparkline: values?.length ? series(values) : undefined,
  change,
});

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
  profileUserId?: string | number,
): UserRow => ({
  name,
  id,
  initials: name.startsWith('[')
    ? '?'
    : name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2),
  cells,
  filters,
  action,
  actionTone,
  profileUserId,
});

const pages: Record<UserView, UserPage> = {
  all: {
    title: 'All Users',
    description: '48,206 registered accounts · search and review user records',
    metrics: [
      metric(
        'Total Users',
        '48,206',
        'All registered accounts',
        '#a78bfa',
        [38000, 39100, 40500, 41800, 43100, 44600, 46200, 48206],
        '4.8%',
      ),
      metric(
        'Active Users (30d)',
        '38,412',
        '79.7% of all users',
        '#2bd4a1',
        [30000, 31600, 32800, 34100, 35600, 37000, 37900, 38412],
        '12.4%',
      ),
      metric(
        'Student Users',
        '12,420',
        '25.8% of all users',
        '#ffb627',
        [9000, 9500, 10100, 10800, 11300, 11700, 12100, 12420],
      ),
      metric(
        'Subscribers',
        '8,612',
        '6,420 currently active',
        '#5b8def',
        [6100, 6500, 7000, 7400, 7800, 8100, 8400, 8612],
      ),
    ],
    columns: ['Type', 'Joined', 'Status', 'KYC', 'Last Active'],
    filters: [
      { label: 'All', key: 'all' },
      { label: 'Students', key: 'student' },
      { label: 'Subscribers', key: 'subscriber' },
      { label: 'Active', key: 'active' },
    ],
    rows: [
      row(
        'Daniel Foster',
        'UK-48291',
        [
          cell('Subscriber', 'violet', true),
          cell('Sep 14, 2024'),
          cell('Active', 'positive', true),
          cell('KYC1', 'positive', true),
          cell('Today · 11:00'),
        ],
        ['subscriber', 'active'],
        'View profile',
        'blue',
      ),
      row(
        'Hannah Wells',
        'UK-48211',
        [
          cell('Student', 'violet', true),
          cell('Jan 2026'),
          cell('Active', 'positive', true),
          cell('KYC1', 'positive', true),
          cell('Today · 10:42'),
        ],
        ['student', 'active'],
        'Review',
        'negative',
      ),
      row(
        'Sophie Lin',
        'UK-47998',
        [
          cell('Student', 'violet', true),
          cell('Oct 2025'),
          cell('Active', 'positive', true),
          cell('KYC1', 'positive', true),
          cell('Today · 09:16'),
        ],
        ['student', 'active'],
      ),
      row(
        'Jonas Reid',
        'UK-48402',
        [
          cell('Subscriber', 'violet', true),
          cell('Feb 14, 2026'),
          cell('Active', 'positive', true),
          cell('KYC1', 'positive', true),
          cell('Yesterday'),
        ],
        ['subscriber', 'active'],
      ),
      row(
        'Imogen Ash',
        'UK-48710',
        [
          cell('Student', 'violet', true),
          cell('Apr 2026'),
          cell('Active', 'positive', true),
          cell('KYC0', 'warning', true),
          cell('Yesterday'),
        ],
        ['student', 'active'],
      ),
      row(
        'Tom Whitlock',
        'UK-48994',
        [
          cell('Standard'),
          cell('May 2026'),
          cell('Review', 'warning', true),
          cell('KYC0', 'warning', true),
          cell('May 8'),
        ],
        ['standard'],
      ),
      row(
        'Helena Moss',
        'UK-48421',
        [
          cell('Subscriber', 'violet', true),
          cell('Mar 2026'),
          cell('Active', 'positive', true),
          cell('KYC1', 'positive', true),
          cell('May 8'),
        ],
        ['subscriber', 'active'],
      ),
    ],
    primaryAction: 'Export CSV',
    secondaryAction: 'New User',
  },
  students: {
    title: 'Student Users',
    description: 'Student user data loaded from the admin service.',
    metrics: [
      metric(
        'Total Student Users',
        '—',
        '',
        '#a78bfa',
      ),
      metric(
        'At Deposit Limit',
        '—',
        '',
        '#ff3b47',
      ),
      metric(
        'Monthly Loss Flags',
        '—',
        '',
        '#ffb627',
      ),
      metric(
        'High Risk / Self Excluded',
        '—',
        '',
        '#ff3b47',
      ),
    ],
    columns: [
      'Joined',
      'Limit Usage',
      'Total Dep.',
      'Net P/L',
      'Loss Months',
      'KYC',
      'Risk',
    ],
    filters: [
      { label: 'All', key: 'all' },
      { label: 'At Limit', key: 'at-limit' },
      { label: 'Monthly Loss', key: 'monthly-loss' },
      { label: 'High Risk', key: 'high-risk' },
      { label: 'Self Excl.', key: 'self-excluded' },
    ],
    rows: [],
    primaryAction: 'Export CSV',
    secondaryAction: 'Batch Review',
  },
  subscriptions: {
    title: 'Subscription Users',
    description: 'All subscribers sorted by expiry',
    metrics: [
      metric(
        'Active Subscribers',
        '6,420',
        'of 8,612 total · 74.5% active',
        '#ff3b47',
        [4800, 5200, 5600, 5900, 6150, 6320, 6400, 6420],
        '11.4%',
      ),
      metric(
        '1-Month Plan',
        '4,220',
        '£9.99/mo · 65.7% share',
        '#a78bfa',
        [3200, 3500, 3800, 4000, 4100, 4180, 4210, 4220],
      ),
      metric(
        '3-Month Plan',
        '2,200',
        '£24.99/3mo · 34.3% share',
        '#5b8def',
        [1600, 1750, 1900, 2000, 2100, 2160, 2190, 2200],
      ),
      metric(
        'Expiring 7d',
        '284',
        '190 auto-renew off',
        '#ffb627',
        [210, 220, 235, 250, 265, 275, 282, 284],
      ),
    ],
    columns: [
      'Plan',
      'Started',
      'Expires',
      'Auto-Renew',
      'LTV',
      'Contests',
      'Engagement',
      'Status',
    ],
    filters: [
      { label: 'All', key: 'all' },
      { label: '1 Month', key: 'one-month' },
      { label: '3 Month', key: 'three-month' },
      { label: 'Expiring', key: 'expiring' },
      { label: 'Expired', key: 'expired' },
    ],
    rows: [
      row(
        'Daniel Foster',
        'UK-48291',
        [
          cell('3 Month', 'violet', true),
          cell('Feb 9'),
          cell('May 9'),
          cell('Off', 'warning', true),
          cell('£74.97'),
          cell('184'),
          cell('92', 'positive', false, 92),
          cell('Active', 'positive', true),
        ],
        ['three-month'],
        'View profile',
        'blue',
      ),
      row(
        'Jonas Reid',
        'UK-48402',
        [
          cell('3 Month', 'violet', true),
          cell('Feb 14'),
          cell('May 14'),
          cell('On', 'positive', true),
          cell('£99.96'),
          cell('92'),
          cell('84', 'positive', false, 84),
          cell('Active', 'positive', true),
        ],
        ['three-month'],
        'View profile',
        'blue',
      ),
      row(
        'Sara Park',
        'UK-49021',
        [
          cell('1 Month', 'negative', true),
          cell('Apr 9'),
          cell('May 9'),
          cell('On', 'positive', true),
          cell('£29.97'),
          cell('44'),
          cell('68', 'warning', false, 68),
          cell('Active', 'positive', true),
        ],
        ['one-month'],
      ),
      row(
        'Marcus Reed',
        'UK-47821',
        [
          cell('3 Month', 'violet', true),
          cell('Feb 16'),
          cell('May 16'),
          cell('Off', 'warning', true),
          cell('£74.97'),
          cell('128'),
          cell('72', 'positive', false, 72),
          cell('Active', 'positive', true),
        ],
        ['three-month'],
      ),
      row(
        'Helena Moss',
        'UK-48421',
        [
          cell('1 Month', 'negative', true),
          cell('Apr 11'),
          cell('May 11 ⚠', 'warning'),
          cell('Off', 'warning', true),
          cell('£9.99'),
          cell('12'),
          cell('42', 'warning', false, 42),
          cell('Nudge', 'warning', true),
        ],
        ['one-month', 'expiring'],
        'Nudge',
        'warning',
      ),
      row(
        'Imogen Ash',
        'UK-48710',
        [
          cell('1 Month', 'negative', true),
          cell('Apr 14'),
          cell('May 14 ⚠', 'warning'),
          cell('Off', 'warning', true),
          cell('£9.99'),
          cell('8'),
          cell('28', 'negative', false, 28),
          cell('Nudge', 'warning', true),
        ],
        ['one-month', 'expiring'],
        'Nudge',
        'warning',
      ),
      row(
        'Karl Vincent',
        'UK-48109',
        [
          cell('1 Month', 'negative', true),
          cell('Apr 18'),
          cell('May 18'),
          cell('On', 'positive', true),
          cell('£19.98'),
          cell('62'),
          cell('78', 'positive', false, 78),
          cell('Active', 'positive', true),
        ],
        ['one-month'],
      ),
    ],
    primaryAction: 'Export CSV',
    secondaryAction: 'Send Campaign',
  },
  consents: {
    title: 'Consent Logs',
    description: 'Immutable · timestamped · all consent types',
    metrics: [
      metric(
        'T&C Consents (30d)',
        '4,218',
        'v2.1 · current version',
        '#5b8def',
        [200, 260, 320, 380, 400, 360, 300, 240],
      ),
      metric(
        'Privacy Policy (30d)',
        '4,218',
        'v2.0 · current version',
        '#a78bfa',
        [200, 260, 320, 380, 400, 360, 300, 240],
      ),
      metric(
        'Marketing Opt-In',
        '18,204',
        '37.8% of users opted in',
        '#2bd4a1',
        [14000, 15000, 16200, 17000, 17600, 17900, 18100, 18204],
      ),
      metric(
        'Pending Re-consent',
        '842',
        'Policy v2.1 change · 7d',
        '#ffb627',
        [400, 520, 640, 720, 780, 820, 838, 842],
        '12%',
      ),
    ],
    columns: ['Type', 'Version', 'Action', 'Date', 'IP', 'Device', 'Status'],
    filters: [
      { label: 'All', key: 'all' },
      { label: 'T&C', key: 'terms' },
      { label: 'Privacy', key: 'privacy' },
      { label: 'Marketing', key: 'marketing' },
      { label: 'RG', key: 'rg' },
      { label: 'AML', key: 'aml' },
    ],
    rows: [
      row(
        'Daniel Foster',
        'UK-48291',
        [
          cell('T&C', 'blue', true),
          cell('v2.1'),
          cell('Accepted', 'positive'),
          cell('May 9 · 10:05'),
          cell('88.156.42.18'),
          cell('Chrome · macOS'),
          cell('Active', 'positive', true),
        ],
        ['terms'],
      ),
      row(
        'Daniel Foster',
        'UK-48291',
        [
          cell('Privacy Policy', 'violet', true),
          cell('v2.0'),
          cell('Accepted', 'positive'),
          cell('May 9 · 10:05'),
          cell('88.156.42.18'),
          cell('Chrome · macOS'),
          cell('Active', 'positive', true),
        ],
        ['privacy'],
      ),
      row(
        'Daniel Foster',
        'UK-48291',
        [
          cell('Marketing', 'positive', true),
          cell('v1.0'),
          cell('Declined', 'negative'),
          cell('May 9 · 10:05'),
          cell('88.156.42.18'),
          cell('Chrome · macOS'),
          cell('Opt-out', 'muted', true),
        ],
        ['marketing'],
      ),
      row(
        'Sara Park',
        'UK-49021',
        [
          cell('T&C', 'blue', true),
          cell('v2.1'),
          cell('Accepted', 'positive'),
          cell('May 8 · 14:22'),
          cell('81.130.20.4'),
          cell('Safari · iOS'),
          cell('Active', 'positive', true),
        ],
        ['terms'],
      ),
      row(
        'Sara Park',
        'UK-49021',
        [
          cell('RG Policy', 'warning', true),
          cell('v1.4'),
          cell('Accepted', 'positive'),
          cell('May 8 · 14:22'),
          cell('81.130.20.4'),
          cell('Safari · iOS'),
          cell('Active', 'positive', true),
        ],
        ['rg'],
      ),
      row(
        'Aaron Khouri',
        'UK-48820',
        [
          cell('T&C', 'blue', true),
          cell('v2.0'),
          cell('Accepted', 'positive'),
          cell('May 1 · 09:18'),
          cell('88.156.43.22'),
          cell('Chrome · Win'),
          cell('Active', 'positive', true),
        ],
        ['terms'],
      ),
      row(
        'Aaron Khouri',
        'UK-48820',
        [
          cell('T&C', 'blue', true),
          cell('v2.1'),
          cell('Pending', 'warning'),
          cell('Expires May 16'),
          cell('—'),
          cell('—'),
          cell('Pending', 'warning', true),
        ],
        ['terms', 'pending'],
      ),
      row(
        'Helena Moss',
        'UK-48421',
        [
          cell('AML Consent', 'negative', true),
          cell('v1.2'),
          cell('Accepted', 'positive'),
          cell('Apr 11 · 10:30'),
          cell('88.156.41.10'),
          cell('Firefox · macOS'),
          cell('Active', 'positive', true),
        ],
        ['aml'],
      ),
    ],
    primaryAction: 'Export Audit Trail',
    secondaryAction: 'Force Re-consent',
  },
  deleted: {
    title: 'Deleted Accounts',
    description: 'GDPR-compliant · anonymised after erasure window',
    metrics: [
      metric(
        'Deleted (30d)',
        '48',
        '38 user-requested · 10 admin',
        '#ff3b47',
        [28, 32, 36, 34, 40, 44, 46, 48],
      ),
      metric(
        'Total Deleted',
        '342',
        'of 48,548 total ever',
        '#a78bfa',
        [240, 260, 280, 300, 316, 330, 338, 342],
      ),
      metric(
        'Data Erased',
        '286',
        '83.6% · avg 24h post-request',
        '#2bd4a1',
        [200, 224, 248, 264, 276, 282, 285, 286],
      ),
      metric(
        'Pending Erasure',
        '56',
        'within 30-day GDPR window',
        '#ffb627',
        [40, 44, 48, 50, 52, 54, 55, 56],
      ),
    ],
    columns: [
      'Reason',
      'Requested',
      'Deleted By',
      'Balance at Delete',
      'Erasure Due',
      'Status',
    ],
    filters: [
      { label: 'All', key: 'all' },
      { label: 'User Request', key: 'user-request' },
      { label: 'Admin', key: 'admin' },
      { label: 'Pending Erasure', key: 'pending-erasure' },
      { label: 'Erased', key: 'erased' },
    ],
    rows: [
      row(
        '[Redacted User]',
        'UK-48102',
        [
          cell('GDPR right to erasure'),
          cell('May 8'),
          cell('User'),
          cell('£0.00', 'muted'),
          cell('Jun 7'),
          cell('Pending', 'warning', true),
        ],
        ['user-request', 'pending-erasure'],
      ),
      row(
        '[Redacted User]',
        'UK-47820',
        [
          cell('User requested closure'),
          cell('May 6'),
          cell('User'),
          cell('£12.40', 'warning'),
          cell('Jun 5 ⚠', 'warning'),
          cell('Pending', 'warning', true),
        ],
        ['user-request', 'pending-erasure'],
      ),
      row(
        'Tom Whitlock',
        'UK-48994',
        [
          cell('Admin — SoF non-compliance'),
          cell('May 1'),
          cell('Harman M.'),
          cell('£0.00', 'muted'),
          cell('May 31'),
          cell('Pending', 'warning', true),
        ],
        ['admin', 'pending-erasure'],
      ),
      row(
        '[Erased]',
        'UK-47602',
        [
          cell('User requested closure'),
          cell('Apr 14'),
          cell('User'),
          cell('—', 'muted'),
          cell('May 14'),
          cell('Erased', 'positive', true),
        ],
        ['user-request', 'erased'],
      ),
      row(
        '[Erased]',
        'UK-47580',
        [
          cell('Duplicate account'),
          cell('Apr 12'),
          cell('Mei S.'),
          cell('—', 'muted'),
          cell('May 12'),
          cell('Erased', 'positive', true),
        ],
        ['admin', 'erased'],
      ),
      row(
        '[Erased]',
        'UK-47411',
        [
          cell('User requested closure'),
          cell('Apr 2'),
          cell('User'),
          cell('—', 'muted'),
          cell('May 2'),
          cell('Erased', 'positive', true),
        ],
        ['user-request', 'erased'],
      ),
      row(
        '[Erased]',
        'UK-47200',
        [
          cell('Bonus abuse — closed'),
          cell('Mar 24'),
          cell('Jordan D.'),
          cell('—', 'muted'),
          cell('Apr 23'),
          cell('Erased', 'positive', true),
        ],
        ['admin', 'erased'],
      ),
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
  loading = false;
  isStudentView = false;
  isSubscriptionView = false;
  isConsentView = false;
  private subscriptionLoadSequence = 0;
  studentPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null = null;
  subscriptionPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null = null;
  consentPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null = null;

  constructor(
    private route: ActivatedRoute,
    private admin: AdminService,
  ) {
    // The layout reads page actions as soon as the router activates this
    // component. Initialize from the route snapshot before the first check so
    // it never briefly exposes the default All Users action on another view.
    const initialView = this.route.snapshot.data['view'] as UserView | undefined;
    this.page = initialView ? pages[initialView] : pages.all;
    this.isStudentView = initialView === 'students';
    this.isSubscriptionView = initialView === 'subscriptions';
    this.isConsentView = initialView === 'consents';
  }

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      const view = data['view'] as UserView | undefined;
      this.page = view ? pages[view] : pages.all;
      this.isStudentView = view === 'students';
      this.isSubscriptionView = view === 'subscriptions';
      this.isConsentView = view === 'consents';
      this.activeFilter = 'all';
      this.searchTerm = '';
      this.studentPagination = null;
      this.subscriptionPagination = null;
      this.consentPagination = null;
      this.notice = '';
      if (view === 'students') {
        this.page = {
          ...pages.students,
          description: 'Loading student users…',
          rows: [],
          metrics: pages.students.metrics.map((item) => ({
            ...item,
            value: '—',
            detail: 'Loading…',
          })),
        };
        this.loadStudents(1);
      } else if (view === 'subscriptions') {
        this.page = {
          ...pages.subscriptions,
          description: 'Loading subscription records…',
          rows: [],
          metrics: pages.subscriptions.metrics.map((item) => ({
            ...item,
            value: '—',
            detail: 'Loading…',
            sparkline: undefined,
          })),
        };
        this.loadSubscriptions(1);
      } else if (view === 'consents') {
        this.page = {
          ...pages.consents,
          description: 'Loading consent records…',
          rows: [],
          metrics: pages.consents.metrics.map((item) => ({
            ...item,
            value: '—',
            detail: 'Loading…',
            sparkline: undefined,
          })),
        };
        this.loadConsents(1);
      }
    });
  }

  private loadStudents(pageNumber: number): void {
    this.loading = true;
    const filter = this.activeFilter === 'all' ? '' : this.activeFilter;
    this.admin.getStudentUsers(pageNumber, 20, filter).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (!Array.isArray(response?.data)) {
          this.showStudentLoadFailure(
            'The student users response was not in the expected format.',
          );
          return;
        }
        const summary = response.summary ?? {};
        const pagination = response.pagination ?? {};
        const money = (value: number | null | undefined) =>
          new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
            maximumFractionDigits: 2,
          }).format(value ?? 0);
        const date = (value: string | null | undefined) =>
          value
            ? new Date(value).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : '—';
        const number = (value: number | null | undefined) =>
          new Intl.NumberFormat('en-GB').format(value ?? 0);
        this.page = {
          title: 'Student Users',
          description: `${number(summary.total_students)} students · ${number(summary.monthly_loss_flags)} monthly loss flags · ${number(summary.high_risk)} high risk`,
          metrics: [
            metric(
              'Total Student Users',
              number(summary.total_students),
              `Cap ${number(summary.student_cap)} per student`,
              '#a78bfa',
            ),
            metric(
              'At Deposit Limit',
              number(summary.at_deposit_limit),
              'Currently at their limit',
              '#ff3b47',
            ),
            metric(
              'Monthly Loss Flags',
              number(summary.monthly_loss_flags),
              'Users with monthly loss flags',
              '#ffb627',
            ),
            metric(
              'High Risk / Self Excluded',
              `${number(summary.high_risk)} / ${number(summary.self_excluded)}`,
              'High risk / self excluded users',
              '#ff3b47',
            ),
          ],
          columns: [
            'Joined',
            'Limit Usage',
            'Total Dep.',
            'Net P/L',
            'Loss Months',
            'KYC',
            'Risk',
          ],
          filters: [
            { label: 'All', key: 'all' },
            { label: 'At Limit', key: 'at-limit' },
            { label: 'Monthly Loss', key: 'monthly-loss' },
            { label: 'High Risk', key: 'high-risk' },
            { label: 'Self Excl.', key: 'self-excluded' },
          ],
          rows: response.data.map((user: any): UserRow => {
            const usage = Math.max(
              0,
              Math.min(100, Number(user.limit_usage_pct) || 0),
            );
            const filters = [
              ...(user.at_limit ? ['at-limit'] : []),
              ...(Number(user.loss_months_12m) > 0 ? ['monthly-loss'] : []),
              ...(Number(user.risk_score) >= 70 ? ['high-risk'] : []),
              ...(user.self_excluded ? ['self-excluded'] : []),
            ];
            const kyc = String(user.kyc_status ?? 'unknown').replace(/_/g, ' ');
            return row(
              String(user.name ?? 'Unknown user'),
              String(user.usercode ?? user.user_id ?? '—'),
              [
                cell(date(user.joined_at)),
                cell(
                  `${money(user.used_this_month)} / ${money(user.deposit_limit)}`,
                  usage >= 90 ? 'warning' : 'violet',
                  false,
                  usage,
                ),
                cell(money(user.total_deposits)),
                cell(
                  money(user.net_pl),
                  Number(user.net_pl) < 0 ? 'negative' : 'positive',
                ),
                cell(
                  number(user.loss_months_12m),
                  Number(user.loss_months_12m) > 0 ? 'warning' : 'muted',
                  true,
                ),
                cell(
                  kyc,
                  user.kyc_status === 'approved' ? 'positive' : 'warning',
                  true,
                ),
                cell(
                  number(user.risk_score),
                  Number(user.risk_score) >= 70 ? 'negative' : 'positive',
                  false,
                  Math.max(0, Math.min(100, Number(user.risk_score) || 0)),
                ),
              ],
              filters,
              'View profile',
              'blue',
              user.user_id,
            );
          }),
          primaryAction: 'Export CSV',
          secondaryAction: 'Batch Review',
        };
        this.studentPagination = {
          total: Number(pagination.total) || 0,
          page: Number(pagination.page) || pageNumber,
          limit: Number(pagination.limit) || 20,
          totalPages: Number(pagination.totalPages) || 1,
        };
      },
      error: (error: HttpErrorResponse) => {
        const detail =
          typeof error.error?.message === 'string'
            ? error.error.message
            : error.status === 0
              ? 'The API could not be reached (network or CORS error).'
              : `HTTP ${error.status}${error.statusText ? ` ${error.statusText}` : ''}.`;
        this.showStudentLoadFailure(`Could not load student users: ${detail}`);
      },
    });
  }

  private showStudentLoadFailure(message: string): void {
    this.loading = false;
    this.notice = message;
    this.studentPagination = null;
    this.page = {
      ...this.page,
      description: 'Student user data is unavailable.',
      metrics: this.page.metrics.map((item) => ({
        ...item,
        value: '—',
        detail: 'Unavailable',
        sparkline: undefined,
      })),
      rows: [],
    };
  }

  private loadSubscriptions(pageNumber: number): void {
    this.loading = true;
    const requestSequence = ++this.subscriptionLoadSequence;
    const filter = this.activeFilter === 'all' ? '' : this.activeFilter;
    this.admin
      .getSubscriptionUsers(pageNumber, 20, filter, this.searchTerm.trim())
      .subscribe({
        next: (response: any) => {
          if (requestSequence !== this.subscriptionLoadSequence) return;
          this.loading = false;
          if (!Array.isArray(response?.data)) {
            this.showSubscriptionLoadFailure(
              'The subscription users response was not in the expected format.',
            );
            return;
          }

          const summary = response.summary ?? {};
          const pagination = response.pagination ?? {};
          const number = (value: number | null | undefined) =>
            new Intl.NumberFormat('en-GB').format(Number(value) || 0);
          const money = (value: number | null | undefined) =>
            new Intl.NumberFormat('en-GB', {
              style: 'currency',
              currency: 'GBP',
              maximumFractionDigits: 2,
            }).format(Number(value) || 0);
          const date = (value: string | null | undefined) => {
            if (!value) return '—';
            const parsed = new Date(value);
            return Number.isNaN(parsed.getTime())
              ? '—'
              : parsed.toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                });
          };

          this.page = {
            ...pages.subscriptions,
            description: `${number(summary.total_subscribers)} subscribers · ${number(summary.active)} active · ${number(summary.expired)} expired`,
            metrics: [
              metric(
                'Total Subscribers',
                number(summary.total_subscribers),
                `${number(summary.active_pct)}% currently active`,
                '#ff3b47',
              ),
              metric(
                'Active Subscribers',
                number(summary.active),
                'Subscriptions currently active',
                '#2bd4a1',
              ),
              metric(
                'Plan Mix · 1 / 3 Month',
                `${number(summary.plan_1m)} / ${number(summary.plan_3m)}`,
                `${number(summary.plan_1m_share)}% / ${number(summary.plan_3m_share)}% share`,
                '#a78bfa',
              ),
              metric(
                'Expiring in 7 Days',
                number(summary.expiring_7d),
                `${number(summary.expiring_auto_renew_off)} auto-renew off`,
                '#ffb627',
              ),
            ],
            rows: response.data.map((subscription: any): UserRow => {
              const plan = String(subscription.plan ?? 'Unknown plan');
              const planKey = plan.toLowerCase().startsWith('3')
                ? 'three-month'
                : 'one-month';
              const status = String(subscription.status ?? 'unknown').toLowerCase();
              const daysLeft = Number(subscription.days_left);
              const expiring =
                status !== 'expired' && daysLeft >= 0 && daysLeft <= 7;
              const filters = [planKey];
              if (status === 'expired' || daysLeft < 0) filters.push('expired');
              if (expiring) filters.push('expiring');
              const statusTone: Tone =
                status === 'active'
                  ? 'positive'
                  : status === 'expired'
                    ? 'muted'
                    : 'warning';
              const expiryTone: Tone =
                status === 'expired' || daysLeft < 0
                  ? 'muted'
                  : expiring
                    ? 'warning'
                    : 'positive';
              const engagement = Math.max(
                0,
                Math.min(100, Number(subscription.engagement) || 0),
              );

              return row(
                String(subscription.name ?? 'Unknown user'),
                String(subscription.usercode ?? subscription.user_id ?? '—'),
                [
                  cell(plan, planKey === 'three-month' ? 'violet' : 'blue', true),
                  cell(date(subscription.started_at)),
                  cell(date(subscription.expires_at), expiryTone),
                  cell(
                    subscription.auto_renew ? 'On' : 'Off',
                    subscription.auto_renew ? 'positive' : 'warning',
                    true,
                  ),
                  cell(money(subscription.lifetime_spend)),
                  cell(number(subscription.contests)),
                  cell(
                    number(subscription.engagement),
                    engagement >= 70
                      ? 'positive'
                      : engagement >= 35
                        ? 'warning'
                        : 'muted',
                    false,
                    engagement,
                  ),
                  cell(
                    status.charAt(0).toUpperCase() + status.slice(1),
                    statusTone,
                    true,
                  ),
                ],
                filters,
                'View profile',
                'blue',
                subscription.user_id,
              );
            }),
          };
          this.subscriptionPagination = {
            total: Number(pagination.total) || 0,
            page: Number(pagination.page) || pageNumber,
            limit: Number(pagination.limit) || 20,
            totalPages: Number(pagination.totalPages) || 1,
          };
        },
        error: (error: HttpErrorResponse) => {
          if (requestSequence !== this.subscriptionLoadSequence) return;
          const detail =
            typeof error.error?.message === 'string'
              ? error.error.message
              : error.status === 0
                ? 'The API could not be reached (network or CORS error).'
                : `HTTP ${error.status}${error.statusText ? ` ${error.statusText}` : ''}.`;
          this.showSubscriptionLoadFailure(
            `Could not load subscription users: ${detail}`,
          );
        },
      });
  }

  private showSubscriptionLoadFailure(message: string): void {
    this.loading = false;
    this.notice = message;
    this.subscriptionPagination = null;
    this.page = {
      ...pages.subscriptions,
      description: 'Subscription user data is unavailable.',
      metrics: pages.subscriptions.metrics.map((item) => ({
        ...item,
        value: '—',
        detail: 'Unavailable',
        sparkline: undefined,
      })),
      rows: [],
    };
  }

  private consentPolicyKey(policyType: string): string {
    const policy = policyType.toLowerCase();
    if (policy.includes('terms')) return 'terms';
    if (policy.includes('privacy') || policy.includes('data protection'))
      return 'privacy';
    if (policy.includes('responsible gaming')) return 'rg';
    if (policy.includes('aml') || policy.includes('kyc')) return 'aml';
    if (policy.includes('payment') || policy.includes('wallet'))
      return 'payments';
    if (policy.includes('subscription') || policy.includes('uct'))
      return 'subscription';
    if (policy.includes('communication')) return 'communication';
    return 'other';
  }

  private loadConsents(pageNumber: number): void {
    this.loading = true;
    this.admin.getConsentLogs(pageNumber, 20).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (!Array.isArray(response?.data)) {
          this.showConsentLoadFailure(
            'The consent logs response was not in the expected format.',
          );
          return;
        }

        const summary = response.summary ?? {};
        const policySummaries = Array.isArray(summary.by_policy)
          ? summary.by_policy
          : [];
        const findPolicy = (search: string) =>
          policySummaries.find((policy: any) =>
            String(policy.policy_type ?? '')
              .toLowerCase()
              .includes(search),
          ) ?? {};
        const number = (value: number | null | undefined) =>
          new Intl.NumberFormat('en-GB').format(Number(value) || 0);
        const dateTime = (value: string | null | undefined) => {
          if (!value) return '—';
          const parsed = new Date(value);
          return Number.isNaN(parsed.getTime())
            ? '—'
            : parsed.toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
        };
        const terms = findPolicy('terms and conditions');
        const privacy = findPolicy('privacy and data protection');
        const communication = findPolicy('consent and communication');

        this.page = {
          ...pages.consents,
          description: `Consent audit log · ${number(summary.pending_reconsent_users)} users pending re-consent`,
          metrics: [
            metric(
              'Terms Consents (30d)',
              number(terms.consents_30d),
              `Version ${terms.current_version ?? '—'} · ${number(terms.users_accepted)} users accepted`,
              '#5b8def',
            ),
            metric(
              'Privacy Consents (30d)',
              number(privacy.consents_30d),
              `Version ${privacy.current_version ?? '—'} · ${number(privacy.users_accepted)} users accepted`,
              '#a78bfa',
            ),
            metric(
              'Communication Policy',
              number(communication.users_accepted),
              `Version ${communication.current_version ?? '—'} · users accepted`,
              '#2bd4a1',
            ),
            metric(
              'Pending Re-consent',
              number(summary.pending_reconsent_users),
              'Users requiring updated consent',
              '#ffb627',
            ),
          ],
          columns: [
            'Policy',
            'Version',
            'Action',
            'Accepted At',
            'IP Address',
            'Device',
            'Status',
          ],
          filters: [
            { label: 'All', key: 'all' },
            { label: 'Terms', key: 'terms' },
            { label: 'Privacy', key: 'privacy' },
            { label: 'Responsible Gaming', key: 'rg' },
            { label: 'KYC / AML', key: 'aml' },
            { label: 'Payments', key: 'payments' },
            { label: 'Subscription', key: 'subscription' },
            { label: 'Communication', key: 'communication' },
            { label: 'Other', key: 'other' },
          ],
          rows: response.data.map((consent: any): UserRow => {
            const policyType = String(consent.policy_type ?? 'Unknown policy');
            const policyKey = this.consentPolicyKey(policyType);
            const action = String(consent.action ?? 'Unknown');
            const status = String(consent.status ?? 'unknown');
            const actionTone: Tone =
              action.toLowerCase() === 'accepted' ? 'positive' : 'warning';
            const statusTone: Tone =
              status.toLowerCase() === 'active' ? 'positive' : 'warning';
            return row(
              String(consent.name ?? 'Unknown user'),
              String(consent.usercode ?? consent.user_id ?? '—'),
              [
                cell(policyType, 'blue', true),
                cell(String(consent.version ?? '—')),
                cell(action, actionTone),
                cell(dateTime(consent.accepted_at)),
                cell(String(consent.ip_address ?? '—')),
                cell(String(consent.device ?? '—')),
                cell(
                  status.charAt(0).toUpperCase() + status.slice(1),
                  statusTone,
                  true,
                ),
              ],
              [policyKey],
              'View profile',
              'blue',
              consent.user_id,
            );
          }),
        };

        const pagination = response.pagination ?? {};
        this.consentPagination = {
          total: Number(pagination.total) || 0,
          page: Number(pagination.page) || pageNumber,
          limit: Number(pagination.limit) || 20,
          totalPages: Number(pagination.totalPages) || 1,
        };
      },
      error: (error: HttpErrorResponse) => {
        const detail =
          typeof error.error?.message === 'string'
            ? error.error.message
            : error.status === 0
              ? 'The API could not be reached (network or CORS error).'
              : `HTTP ${error.status}${error.statusText ? ` ${error.statusText}` : ''}.`;
        this.showConsentLoadFailure(`Could not load consent logs: ${detail}`);
      },
    });
  }

  private showConsentLoadFailure(message: string): void {
    this.loading = false;
    this.notice = message;
    this.consentPagination = null;
    this.page = {
      ...pages.consents,
      description: 'Consent log data is unavailable.',
      metrics: pages.consents.metrics.map((item) => ({
        ...item,
        value: '—',
        detail: 'Unavailable',
        sparkline: undefined,
      })),
      rows: [],
    };
  }

  get studentRangeLabel(): string {
    if (!this.studentPagination || this.studentPagination.total === 0)
      return 'Showing 0 of 0 records';
    const start =
      (this.studentPagination.page - 1) * this.studentPagination.limit + 1;
    const end = Math.min(
      this.studentPagination.page * this.studentPagination.limit,
      this.studentPagination.total,
    );
    return `Showing ${start}–${end} of ${this.studentPagination.total} records`;
  }

  get activeServerPagination() {
    if (this.isConsentView) return this.consentPagination;
    return this.isSubscriptionView ? this.subscriptionPagination : this.studentPagination;
  }

  get serverRangeLabel(): string {
    const pagination = this.activeServerPagination;
    if (!pagination || pagination.total === 0) return 'Showing 0 of 0 records';
    const start = (pagination.page - 1) * pagination.limit + 1;
    const end = Math.min(pagination.page * pagination.limit, pagination.total);
    return `Showing ${start}–${end} of ${pagination.total} records`;
  }

  previousServerPage(): void {
    const pagination = this.activeServerPagination;
    if (!pagination || pagination.page <= 1) return;
    if (this.isConsentView) this.loadConsents(pagination.page - 1);
    else if (this.isSubscriptionView) this.loadSubscriptions(pagination.page - 1);
    else this.loadStudents(pagination.page - 1);
  }

  nextServerPage(): void {
    const pagination = this.activeServerPagination;
    if (!pagination || pagination.page >= pagination.totalPages) return;
    if (this.isConsentView) this.loadConsents(pagination.page + 1);
    else if (this.isSubscriptionView) this.loadSubscriptions(pagination.page + 1);
    else this.loadStudents(pagination.page + 1);
  }

  previousStudentsPage(): void {
    if (this.studentPagination && this.studentPagination.page > 1)
      this.loadStudents(this.studentPagination.page - 1);
  }

  nextStudentsPage(): void {
    if (
      this.studentPagination &&
      this.studentPagination.page < this.studentPagination.totalPages
    )
      this.loadStudents(this.studentPagination.page + 1);
  }

  get filteredRows(): UserRow[] {
    const query = this.searchTerm.trim().toLowerCase();
    return this.page.rows.filter((record) => {
      const matchesFilter =
        this.activeFilter === 'all' ||
        record.filters.includes(this.activeFilter);
      const matchesSearch =
        !query ||
        `${record.name} ${record.id} ${record.cells.map((item) => item.value).join(' ')}`
          .toLowerCase()
          .includes(query);
      return matchesFilter && matchesSearch;
    });
  }

  get hasActions(): boolean {
    return this.page.rows.some((record) => record.action !== undefined);
  }

  setFilter(key: string): void {
    this.activeFilter = key;
    const view = this.route.snapshot.data['view'] as UserView | undefined;
    if (view === 'students') {
      this.searchTerm = '';
      this.loadStudents(1);
    } else if (view === 'subscriptions') {
      this.searchTerm = '';
      this.loadSubscriptions(1);
    }
  }

  setSearchTerm(value: string): void {
    if (this.searchTerm === value) return;
    this.searchTerm = value;
    if (this.isSubscriptionView) this.loadSubscriptions(1);
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
    if (this.page.filters.some((item) => item.key === filterKey)) {
      this.setFilter(filterKey);
      this.notice = `Showing ${this.page.filters.find((item) => item.key === filterKey)?.label.toLowerCase()} records.`;
      return;
    }
    this.notice = `${this.page.secondaryAction} is available through the connected admin service.`;
  }

  exportCsv(): void {
    const headers = ['User', 'User ID', ...this.page.columns];
    const records = this.filteredRows.map((record) => [
      record.name,
      record.id,
      ...record.cells.map((item) => item.value),
    ]);
    const escape = (value: string): string => `"${value.replace(/"/g, '""')}"`;
    const csv = [headers, ...records]
      .map((values) => values.map(escape).join(','))
      .join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.page.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
