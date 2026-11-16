import { RgRecordsPage, rgMetric } from './rg.models';

export type RgRecordsView =
  | 'deposit-limits'
  | 'limit-reductions'
  | 'monthly-loss'
  | 'self-exclusion'
  | 'alerts';

const depositLimits: RgRecordsPage = {
  title: 'Deposit Limits — All Users',
  description: 'Sorted by risk · showing at-limit first',
  metrics: [
    rgMetric('Users With Limit Set', '8,420', '17.5% of users', '#a78bfa', [6200, 6500, 6700, 6900, 7100, 7300, 7500, 7700, 7900, 8000, 8100, 8250, 8350, 8420]),
    rgMetric('At Daily Limit', '284', '3.4% of limit-setters', '#ff3b47', [200, 210, 220, 230, 238, 244, 252, 258, 264, 268, 274, 278, 282, 284], '8%'),
    rgMetric('At Monthly Limit', '142', '1.7% of limit-setters', '#ffb627', [100, 108, 112, 118, 122, 126, 130, 134, 136, 138, 140, 141, 142, 142], '6%'),
    rgMetric('Student-Cap Breaches', '22', '£500/mo hard cap', '#ff3b47', [14, 15, 16, 17, 18, 18, 19, 20, 20, 21, 21, 22, 22, 22]),
  ],
  columns: ['Tier', 'Limit Type', 'Cap', 'Used Today', 'Used Month', 'Reduction Req.', 'Status'],
  filters: [
    { label: 'All', key: 'all' },
    { label: 'Daily', key: 'daily' },
    { label: 'Weekly', key: 'weekly' },
    { label: 'Monthly', key: 'monthly' },
    { label: 'Student Cap', key: 'student' },
  ],
  rows: [
    { name: 'Hannah Wells', id: 'UK-48211', filters: ['monthly', 'student', 'at-limit'], highlight: true, cells: [
      { value: 'Student', tone: 'red', badge: true }, { value: 'Monthly' }, { value: '£500', tone: 'muted' }, { value: '—' }, { value: '£500', tone: 'red' }, { value: 'Pending', tone: 'amber', badge: true }, { value: 'Review', tone: 'red', action: true },
    ] },
    { name: 'Sophie Lin', id: 'UK-47998', filters: ['monthly', 'student', 'at-limit'], highlight: true, cells: [
      { value: 'Student', tone: 'red', badge: true }, { value: 'Monthly' }, { value: '£500', tone: 'muted' }, { value: '—' }, { value: '£500', tone: 'red' }, { value: 'Pending', tone: 'amber', badge: true }, { value: 'Review', tone: 'red', action: true },
    ] },
    { name: 'Aaron Khouri', id: 'UK-48820', filters: ['monthly'], cells: [
      { value: 'Other', tone: 'muted', badge: true }, { value: 'Monthly' }, { value: '£2,000', tone: 'muted' }, { value: '£180' }, { value: '£2,000', tone: 'red' }, { value: '—', tone: 'muted' }, { value: 'Review', tone: 'red', action: true },
    ] },
    { name: 'Tom Whitlock', id: 'UK-48994', filters: ['daily'], cells: [
      { value: 'Other', tone: 'muted', badge: true }, { value: 'Daily' }, { value: '£500', tone: 'muted' }, { value: '£500', tone: 'red' }, { value: '£1,400', tone: 'amber' }, { value: '—', tone: 'muted' }, { value: 'OK', tone: 'green', badge: true },
    ] },
    { name: 'Daniel Foster', id: 'UK-48291', filters: ['monthly'], cells: [
      { value: 'Subscriber', tone: 'violet', badge: true }, { value: 'Monthly' }, { value: '£3,000', tone: 'muted' }, { value: '£25' }, { value: '£1,200', tone: 'amber' }, { value: '—', tone: 'muted' }, { value: 'OK', tone: 'green', badge: true },
    ] },
    { name: 'Marcus Reed', id: 'UK-47821', filters: ['weekly'], cells: [
      { value: 'Other', tone: 'muted', badge: true }, { value: 'Weekly' }, { value: '£500', tone: 'muted' }, { value: '£80' }, { value: '£360', tone: 'amber' }, { value: '—', tone: 'muted' }, { value: 'OK', tone: 'green', badge: true },
    ] },
    { name: 'Sara Park', id: 'UK-49021', filters: ['daily'], highlight: true, cells: [
      { value: 'Subscriber', tone: 'violet', badge: true }, { value: 'Daily' }, { value: '£200', tone: 'muted' }, { value: '£0' }, { value: '£200', tone: 'red' }, { value: '—', tone: 'muted' }, { value: 'Review', tone: 'red', action: true },
    ] },
  ],
  primaryAction: 'Export CSV',
  secondaryAction: 'Review At-Limit',
  activeTone: 'violet',
};

const limitReductions: RgRecordsPage = {
  title: 'Limit Change Requests',
  description: 'Reductions: immediate · Increases: 7-day cooling-off (UK regulations)',
  metrics: [
    rgMetric('Reductions (30d)', '184', 'UK regs: immediate effect', '#a78bfa', [130, 136, 142, 148, 154, 158, 162, 166, 170, 174, 178, 180, 182, 184]),
    rgMetric('Awaiting 7-Day Period', '42', 'Increases · cooling-off active', '#ffb627', [30, 32, 34, 36, 38, 40, 40, 41, 42, 42, 42, 42, 42, 42]),
    rgMetric('Avg Reduction %', '−38%', '£480 → £297 avg', '#2bd4a1', [30, 32, 33, 34, 35, 36, 37, 37, 38, 38, 38, 38, 38, 38]),
    rgMetric('Requests Today', '12', '', '#5b8def', [4, 5, 6, 8, 7, 9, 8, 10, 11, 12, 12, 12, 12, 12]),
  ],
  columns: ['Type', 'Old Limit', 'New Limit', 'Change', 'Requested', 'Effective', 'Status'],
  filters: [
    { label: 'All', key: 'all' },
    { label: 'Reductions', key: 'reduction' },
    { label: 'Increases', key: 'increase' },
    { label: 'Pending', key: 'pending' },
  ],
  rows: [
    { name: 'Hannah Wells', id: 'UK-48211', filters: ['reduction'], cells: [
      { value: 'Reduction', tone: 'green', badge: true }, { value: '£500/mo' }, { value: '£200/mo' }, { value: '−60%', tone: 'green' }, { value: 'May 9 · 10:12', tone: 'muted' }, { value: 'Immediate' }, { value: 'Applied', tone: 'green', badge: true },
    ] },
    { name: 'Aaron Khouri', id: 'UK-48820', filters: ['increase', 'pending'], cells: [
      { value: 'Increase', tone: 'amber', badge: true }, { value: '£2,000/mo' }, { value: '£5,000/mo' }, { value: '+150%', tone: 'amber' }, { value: 'May 8 · 08:44', tone: 'muted' }, { value: 'May 15 · 08:44', tone: 'amber' }, { value: 'Cooling-off', tone: 'amber', badge: true },
    ] },
    { name: 'Marcus Reed', id: 'UK-47821', filters: ['reduction'], cells: [
      { value: 'Reduction', tone: 'green', badge: true }, { value: '£500/wk' }, { value: '£200/wk' }, { value: '−60%', tone: 'green' }, { value: 'May 7 · 14:20', tone: 'muted' }, { value: 'Immediate' }, { value: 'Applied', tone: 'green', badge: true },
    ] },
    { name: 'Sara Park', id: 'UK-49021', filters: ['increase', 'pending'], cells: [
      { value: 'Increase', tone: 'amber', badge: true }, { value: '£200/day' }, { value: '£400/day' }, { value: '+100%', tone: 'amber' }, { value: 'May 7 · 09:30', tone: 'muted' }, { value: 'May 14 · 09:30', tone: 'amber' }, { value: 'Cooling-off', tone: 'amber', badge: true },
    ] },
    { name: 'Imogen Ash', id: 'UK-48710', filters: ['reduction'], cells: [
      { value: 'Reduction', tone: 'green', badge: true }, { value: '£500/mo' }, { value: '£100/mo' }, { value: '−80%', tone: 'green' }, { value: 'May 6 · 12:00', tone: 'muted' }, { value: 'Immediate' }, { value: 'Applied', tone: 'green', badge: true },
    ] },
    { name: 'Daniel Foster', id: 'UK-48291', filters: ['increase'], cells: [
      { value: 'Increase', tone: 'amber', badge: true }, { value: '£3,000/mo' }, { value: '£4,000/mo' }, { value: '+33%', tone: 'amber' }, { value: 'May 5 · 10:00', tone: 'muted' }, { value: 'May 12 · 10:00' }, { value: 'Applied', tone: 'green', badge: true },
    ] },
    { name: 'Tom Whitlock', id: 'UK-48994', filters: ['reduction'], cells: [
      { value: 'Reduction', tone: 'green', badge: true }, { value: '£1,000/day' }, { value: '£500/day' }, { value: '−50%', tone: 'green' }, { value: 'May 4 · 16:30', tone: 'muted' }, { value: 'Immediate' }, { value: 'Applied', tone: 'green', badge: true },
    ] },
  ],
  primaryAction: 'Export Log',
  secondaryAction: 'Apply All Pending',
};

const monthlyLoss: RgRecordsPage = {
  title: 'Monthly Loss — Flagged Users',
  description: 'Sorted by loss streak · intervention status shown',
  metrics: [
    rgMetric('Monthly Loss Users', '184', 'users losing ≥80% of deposit', '#ff3b47', [130, 138, 144, 150, 156, 160, 165, 170, 174, 178, 180, 182, 183, 184], '6%'),
    rgMetric('Consecutive Loss Months', '42', '≥3 months straight loss', '#ffb627', [28, 30, 32, 34, 36, 38, 39, 40, 41, 41, 42, 42, 42, 42], '12%'),
    rgMetric('Total Net Loss (May)', '−£184K', 'across flagged users', '#ff3b47', [120000, 130000, 140000, 148000, 155000, 160000, 166000, 170000, 174000, 178000, 180000, 182000, 183000, 184000]),
    rgMetric('RG Interventions Sent', '96', '52.2% of flagged users', '#a78bfa', [60, 64, 68, 72, 76, 80, 84, 86, 88, 90, 92, 94, 95, 96]),
  ],
  columns: ['Tier', 'Net Loss May', 'Loss Streak', 'Limit Set', 'RG Sent', 'Last Action', 'Status'],
  filters: [
    { label: 'All', key: 'all' },
    { label: 'Streak ≥3', key: 'streak' },
    { label: 'Student', key: 'student' },
    { label: 'No Limit Set', key: 'no-limit' },
    { label: 'No Intervention', key: 'no-intervention' },
  ],
  rows: [
    { name: 'Hannah Wells', id: 'UK-48211', filters: ['streak', 'student', 'no-intervention'], highlight: true, cells: [
      { value: 'Student', tone: 'red', badge: true }, { value: '−£2,400', tone: 'red' }, { value: '5 months', tone: 'red' }, { value: 'Set', tone: 'green', badge: true }, { value: 'Not sent', tone: 'red', badge: true }, { value: '—', tone: 'muted' }, { value: 'Intervene', tone: 'red', action: true },
    ] },
    { name: 'Sophie Lin', id: 'UK-47998', filters: ['streak', 'student'], cells: [
      { value: 'Student', tone: 'red', badge: true }, { value: '−£1,500', tone: 'red' }, { value: '3 months', tone: 'amber' }, { value: 'Set', tone: 'green', badge: true }, { value: 'Sent', tone: 'green', badge: true }, { value: 'Email · May 2', tone: 'muted' }, { value: 'Monitored', tone: 'green', badge: true },
    ] },
    { name: 'Aaron Khouri', id: 'UK-48820', filters: ['streak', 'no-intervention'], highlight: true, cells: [
      { value: 'Other', tone: 'muted', badge: true }, { value: '−£1,840', tone: 'red' }, { value: '4 months', tone: 'red' }, { value: 'Set', tone: 'green', badge: true }, { value: 'Not sent', tone: 'red', badge: true }, { value: '—', tone: 'muted' }, { value: 'Intervene', tone: 'red', action: true },
    ] },
    { name: 'Tom Whitlock', id: 'UK-48994', filters: ['streak', 'no-limit'], highlight: true, cells: [
      { value: 'Other', tone: 'muted', badge: true }, { value: '−£3,200', tone: 'red' }, { value: '6 months', tone: 'red' }, { value: 'None', tone: 'amber', badge: true }, { value: 'Sent', tone: 'green', badge: true }, { value: 'SoF requested May 1', tone: 'muted' }, { value: 'Follow Up', action: true },
    ] },
    { name: 'Tara Goldsmith', id: 'UK-47720', filters: ['student'], cells: [
      { value: 'Student', tone: 'red', badge: true }, { value: '−£1,000', tone: 'red' }, { value: '2 months' }, { value: 'Set', tone: 'green', badge: true }, { value: 'Sent', tone: 'green', badge: true }, { value: 'Email · May 2', tone: 'muted' }, { value: 'Monitored', tone: 'green', badge: true },
    ] },
    { name: 'Imogen Ash', id: 'UK-48710', filters: ['student'], cells: [
      { value: 'Student', tone: 'red', badge: true }, { value: '−£180', tone: 'red' }, { value: '1 months' }, { value: 'Set', tone: 'green', badge: true }, { value: 'Sent', tone: 'green', badge: true }, { value: 'Email · May 2', tone: 'muted' }, { value: 'Monitored', tone: 'green', badge: true },
    ] },
    { name: 'Owen Briggs', id: 'UK-48588', filters: ['no-limit', 'no-intervention'], cells: [
      { value: 'Other', tone: 'muted', badge: true }, { value: '−£420', tone: 'red' }, { value: '2 months' }, { value: 'None', tone: 'amber', badge: true }, { value: 'Not sent', tone: 'red', badge: true }, { value: '—', tone: 'muted' }, { value: 'Intervene', tone: 'red', action: true },
    ] },
  ],
  primaryAction: 'Export at-risk list',
  secondaryAction: 'Send RG Intervention',
};

const selfExclusion: RgRecordsPage = {
  title: 'Self Exclusion Register',
  description: 'GAMSTOP integration · account blocked · all channels',
  metrics: [
    rgMetric('Active Exclusions', '112', '12 expire next 30d', '#ff3b47', [84, 88, 90, 94, 96, 98, 100, 102, 106, 108, 110, 110, 111, 112]),
    rgMetric('GAMSTOP Registered', '284', 'national self-exclusion', '#a78bfa', [220, 232, 244, 252, 260, 264, 268, 272, 276, 278, 280, 282, 283, 284]),
    rgMetric('Expired (30d)', '18', '10 re-registered', '#2bd4a1', [10, 11, 12, 13, 14, 15, 15, 16, 16, 17, 17, 18, 18, 18]),
    rgMetric('Breaches Prevented', '42', 'GAMSTOP blocks (30d)', '#ffb627', [28, 30, 32, 34, 36, 38, 39, 40, 41, 41, 42, 42, 42, 42]),
  ],
  columns: ['Duration', 'Started', 'Expires', 'GAMSTOP', 'Marketing Blocked', 'Balance Returned', 'Status'],
  filters: [
    { label: 'All', key: 'all' },
    { label: 'Active', key: 'active' },
    { label: 'GAMSTOP', key: 'gamstop' },
    { label: 'Expiring', key: 'expiring' },
    { label: 'Expired', key: 'expired' },
  ],
  rows: [
    { name: '[Excluded User]', id: 'UK-47120', filters: ['active', 'gamstop'], cells: [
      { value: 'Permanent' }, { value: 'Jan 2024', tone: 'muted' }, { value: 'Permanent', tone: 'red' }, { value: 'Registered', tone: 'green', badge: true }, { value: 'Blocked', tone: 'green', badge: true }, { value: '£0.00' }, { value: 'Active', tone: 'red', badge: true },
    ] },
    { name: '[Excluded User]', id: 'UK-48012', filters: ['active', 'gamstop'], cells: [
      { value: '5 Year' }, { value: 'Mar 2025', tone: 'muted' }, { value: 'Mar 2030', tone: 'red' }, { value: 'Registered', tone: 'green', badge: true }, { value: 'Blocked', tone: 'green', badge: true }, { value: '£0.00' }, { value: 'Active', tone: 'red', badge: true },
    ] },
    { name: 'Tom Whitlock', id: 'UK-48994', filters: ['active', 'expiring'], cells: [
      { value: '6 Month' }, { value: 'May 2026', tone: 'muted' }, { value: 'Nov 2026', tone: 'red' }, { value: 'Pending', tone: 'amber', badge: true }, { value: 'Blocked', tone: 'green', badge: true }, { value: '£0.00' }, { value: 'Active', tone: 'red', badge: true },
    ] },
    { name: '[Excluded User]', id: 'UK-47602', filters: ['expired', 'gamstop'], cells: [
      { value: '1 Year' }, { value: 'May 2025', tone: 'muted' }, { value: 'May 2026' }, { value: 'Registered', tone: 'green', badge: true }, { value: 'Blocked', tone: 'green', badge: true }, { value: '£142.00' }, { value: 'Expired', tone: 'muted', badge: true },
    ] },
    { name: '[Excluded User]', id: 'UK-47580', filters: ['expired'], cells: [
      { value: '6 Month' }, { value: 'Nov 2025', tone: 'muted' }, { value: 'May 2026' }, { value: 'Not Reg.', tone: 'red', badge: true }, { value: 'Not blocked', tone: 'red', badge: true }, { value: '£84.00' }, { value: 'Expired', tone: 'muted', badge: true },
    ] },
    { name: '[Excluded User]', id: 'UK-47411', filters: ['expired', 'gamstop'], cells: [
      { value: '3 Month' }, { value: 'Feb 2026', tone: 'muted' }, { value: 'May 2026' }, { value: 'Registered', tone: 'green', badge: true }, { value: 'Blocked', tone: 'green', badge: true }, { value: '£0.00' }, { value: 'Expired', tone: 'muted', badge: true },
    ] },
    { name: '[Excluded User]', id: 'UK-46982', filters: ['expired', 'gamstop'], cells: [
      { value: '1 Year' }, { value: 'Apr 2025', tone: 'muted' }, { value: 'Apr 2026' }, { value: 'Registered', tone: 'green', badge: true }, { value: 'Blocked', tone: 'green', badge: true }, { value: '£0.00' }, { value: 'Expired', tone: 'muted', badge: true },
    ] },
  ],
  primaryAction: 'Export Register',
  secondaryAction: 'Process GAMSTOP',
  activeTone: 'violet',
};

const alerts: RgRecordsPage = {
  title: 'Active RG Alerts',
  description: 'Auto-triggered by deposit/loss/session pattern rules',
  metrics: [
    rgMetric('Open Alerts', '27', '14 high priority', '#ff3b47', [14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 26, 27], '18%'),
    rgMetric('Sent Interventions (7d)', '18', '', '#a78bfa', [8, 9, 10, 11, 12, 14, 15, 15, 16, 17, 17, 18, 18, 18]),
    rgMetric('Avg Response Time', '4.2h', 'target <6h', '#2bd4a1', [7, 6.5, 6, 5.5, 5, 4.8, 4.6, 4.5, 4.4, 4.3, 4.3, 4.2, 4.2, 4.2]),
    rgMetric('Resolved (30d)', '142', '', '#5b8def', [100, 108, 112, 118, 122, 126, 130, 134, 136, 138, 140, 141, 142, 142]),
  ],
  columns: ['Alert Type', 'Trigger', 'Priority', 'Age', 'Assigned', 'Action Taken', ''],
  filters: [
    { label: 'All', key: 'all' },
    { label: 'High', key: 'high' },
    { label: 'Medium', key: 'medium' },
    { label: 'Low', key: 'low' },
    { label: 'Resolved', key: 'resolved' },
  ],
  rows: [
    { name: 'Hannah Wells', id: 'UK-48211', filters: ['high'], highlight: true, cells: [
      { value: '5-Month Loss Streak' }, { value: 'ML-STREAK-5', tone: 'muted' }, { value: 'High', tone: 'red', badge: true }, { value: '2h' }, { value: 'Unassigned', tone: 'red' }, { value: '—', tone: 'muted' }, { value: 'Intervene', tone: 'red', action: true },
    ] },
    { name: 'Tom Whitlock', id: 'UK-48994', filters: ['high'], highlight: true, cells: [
      { value: '6-Month Loss Streak' }, { value: 'ML-STREAK-6', tone: 'muted' }, { value: 'High', tone: 'red', badge: true }, { value: '4h' }, { value: 'Unassigned', tone: 'red' }, { value: '—', tone: 'muted' }, { value: 'Intervene', tone: 'red', action: true },
    ] },
    { name: 'Aaron Khouri', id: 'UK-48820', filters: ['high'], cells: [
      { value: '4-Month Loss Streak' }, { value: 'ML-STREAK-4', tone: 'muted' }, { value: 'High', tone: 'red', badge: true }, { value: '8h' }, { value: 'Harman M.' }, { value: 'SoF requested', tone: 'green' }, { value: 'Resolve', action: true },
    ] },
    { name: 'Sophie Lin', id: 'UK-47998', filters: ['high'], cells: [
      { value: 'At Student Limit' }, { value: 'DEP-LIMIT-STUDENT', tone: 'muted' }, { value: 'High', tone: 'red', badge: true }, { value: '12h' }, { value: 'Mei S.' }, { value: 'Email sent', tone: 'green' }, { value: 'Resolve', action: true },
    ] },
    { name: 'Owen Briggs', id: 'UK-48588', filters: ['medium'], cells: [
      { value: 'Rapid Deposit Pattern' }, { value: 'DEP-RAPID-3H', tone: 'muted' }, { value: 'Medium', tone: 'amber', badge: true }, { value: '5h' }, { value: 'Unassigned', tone: 'red' }, { value: '—', tone: 'muted' }, { value: 'Intervene', tone: 'red', action: true },
    ] },
    { name: 'Imogen Ash', id: 'UK-48710', filters: ['medium'], cells: [
      { value: '2-Month Loss + Student' }, { value: 'ML-STREAK-2+STU', tone: 'muted' }, { value: 'Medium', tone: 'amber', badge: true }, { value: '1d' }, { value: 'Jordan D.' }, { value: 'Limit nudge sent', tone: 'green' }, { value: 'Resolve', action: true },
    ] },
    { name: 'Helena Moss', id: 'UK-48421', filters: ['low'], cells: [
      { value: 'First Deposit Loss 80%+' }, { value: 'FTD-LOSS-80', tone: 'muted' }, { value: 'Low', tone: 'blue', badge: true }, { value: '2d' }, { value: 'Sara K.' }, { value: 'Pop-up shown', tone: 'green' }, { value: 'Resolve', action: true },
    ] },
  ],
  primaryAction: 'Mark All Read',
  secondaryAction: 'Bulk Intervene',
};

export const rgRecordsPages: Record<RgRecordsView, RgRecordsPage> = {
  'deposit-limits': depositLimits,
  'limit-reductions': limitReductions,
  'monthly-loss': monthlyLoss,
  'self-exclusion': selfExclusion,
  alerts,
};
