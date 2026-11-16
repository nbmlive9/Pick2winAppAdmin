import { ComplianceCell, ComplianceMetric, CompliancePage, ComplianceRow } from './compliance.models';

const series = (values: number[]): string => {
  const maximum = Math.max(...values);
  const minimum = Math.min(...values);
  const range = maximum - minimum || 1;
  return values.map((value, index) => {
    const x = (index / (values.length - 1)) * 100;
    const y = 28 - ((value - minimum) / range) * 24;
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
): ComplianceMetric => ({ label, value, detail, color, points: series(values), change });

const person = (name: string, id: string, initials?: string, restricted = false): ComplianceCell => ({
  text: name,
  kind: 'person',
  id,
  initials: initials || (name.startsWith('[') ? '?' : name.split(' ').map(part => part[0]).slice(0, 2).join('')),
  restricted,
});
const mono = (text: string, tone?: ComplianceCell['tone']): ComplianceCell => ({ text, kind: 'mono', tone });
const badge = (text: string, tone: ComplianceCell['tone'] = 'muted'): ComplianceCell => ({ text, kind: 'badge', tone });
const score = (value: number, color: string): ComplianceCell => ({ text: `${value}`, kind: 'score', score: value, color });
const action = (text: string, tone: ComplianceCell['tone'] = 'muted'): ComplianceCell => ({ text, kind: 'action', tone });
const row = (cells: ComplianceCell[], filters: string[], highlight = false): ComplianceRow => ({ cells, filters, highlight });

const pages: Record<string, CompliancePage> = {
  cases: {
    title: 'Compliance Cases',
    crumbs: ['Compliance', 'Cases'],
    primaryAction: 'SAR Export',
    secondaryAction: 'Open Case',
    subtitle: '',
    metrics: [
      metric('KYC0 Pending', '62', 'avg wait 4h 12m', '#5b8def', [10, 12, 9, 14, 18, 15, 12, 16, 20, 18, 22, 19, 24, 28]),
      metric('KYC1 Pending', '138', '42 over 24h SLA', '#ffb627', [40, 44, 38, 52, 58, 54, 62, 68, 72, 68, 82, 88, 92, 98], '9.4%'),
      metric('AML Alerts', '27', '8 high · 12 med · 7 low', '#ff3b47', [6, 8, 4, 10, 12, 9, 14, 16, 18, 14, 20, 22, 24, 27], '14%'),
      metric('SoF Cases', '14', '£2K+ deposits triggered', '#a78bfa', [2, 3, 2, 4, 5, 3, 6, 8, 7, 9, 10, 11, 13, 14]),
      metric('PEP / Sanctions', '3', '2 Tier-1 · 1 Tier-2', '#2bd4a1', [1, 1, 2, 2, 1, 2, 3, 3, 3, 2, 3, 3, 3, 3]),
    ],
    tableTitle: 'Active Compliance Cases',
    tableDescription: '206 open · 14 SLA breach · 8 escalated',
    filters: [{ label: 'All', key: 'all' }, { label: 'AML', key: 'aml' }, { label: 'SoF', key: 'sof' }, { label: 'KYC1', key: 'kyc1' }, { label: 'PEP', key: 'pep' }, { label: 'Fraud', key: 'fraud' }],
    columns: ['Case', 'User', 'Risk Type', 'Trigger', 'Risk Score', 'Age', 'Assignee', 'Status'],
    rows: [
      row([mono('CMP-9182', 'blue'), person('Rebecca Hale', 'UK-49120', 'RH'), badge('AML High', 'red'), { text: '3 deposits £2,400 in 18m' }, score(88, '#ff3b47'), mono('2h'), badge('MS', 'blue'), badge('Investigating', 'violet')], ['aml']),
      row([mono('CMP-9181', 'blue'), person('Tom Whitlock', 'UK-48994', 'TW'), badge('SoF £5K+', 'muted'), { text: '£6,200 deposit · new card' }, score(74, '#ffb627'), mono('4h'), badge('JD', 'blue'), badge('Pending', 'amber')], ['sof']),
      row([mono('CMP-9178', 'blue'), person('Aaron Khouri', 'UK-48820', 'AK'), badge('Multiple Accts'), { text: 'Shared device · 4 IDs' }, score(92, '#ff3b47'), mono('6h'), badge('MS', 'blue'), badge('Escalated', 'red')], ['fraud'], true),
      row([mono('CMP-9176', 'blue'), person('Liam Gardner', 'UK-48771', 'LG'), badge('PEP Tier-1'), { text: 'Match: name + DOB' }, score(68, '#ffb627'), mono('1d'), mono('—'), badge('Pending', 'amber')], ['pep']),
      row([mono('CMP-9172', 'blue'), person('Priya Shastri', 'UK-48604', 'PS'), badge('Bonus Abuse'), { text: '14 referrals · same IP' }, score(81, '#ff3b47'), mono('1d'), badge('JD', 'blue'), badge('Investigating', 'violet')], ['fraud']),
      row([mono('CMP-9170', 'blue'), person('Owen Briggs', 'UK-48588', 'OB'), badge('Rapid W/D'), { text: 'Dep £400 → W/D £380' }, score(64, '#ffb627'), mono('2d'), mono('—'), badge('On Hold', 'blue')], ['aml']),
      row([mono('CMP-9165', 'blue'), person('Helena Moss', 'UK-48421', 'HM'), badge('Sanctions'), { text: 'OFAC partial match' }, score(58, '#5b8def'), mono('2d'), badge('MS', 'blue'), badge('Approved', 'green')], ['pep']),
    ],
  },
  kyc0: {
    title: 'KYC0 Verification', crumbs: ['Compliance', 'KYC0 Verification'],
    primaryAction: 'Export Pending', secondaryAction: 'Auto-Approve Pass', subtitle: '',
    metrics: [
      metric('Pending KYC0', '62', 'Email + DoB · basic tier', '#ffb627', [44, 46, 48, 50, 52, 54, 55, 57, 58, 59, 60, 61, 62, 62], '4%'),
      metric('Passed Today', '124', '', '#2bd4a1', [80, 88, 94, 100, 106, 110, 114, 116, 118, 120, 122, 123, 124, 124]),
      metric('Failed / Retry', '18', '', '#ff3b47', [10, 11, 12, 13, 14, 15, 15, 16, 16, 17, 17, 18, 18, 18]),
      metric('Avg Completion Time', '1.2m', 'target <3m', '#5b8def', [32, 30, 28, 26, 24, 22, 20, 18, 17, 15, 14, 13, 12, 12]),
    ],
    tableTitle: 'KYC0 Queue — Email & Date of Birth',
    tableDescription: 'Automated check · Age verification + email confirmation',
    filters: [{ label: 'All', key: 'all' }, { label: 'Pending', key: 'pending' }, { label: 'Failed', key: 'failed' }, { label: 'Under 18', key: 'under18' }],
    columns: ['User', 'Email Verified', 'DoB Submitted', 'Age Check', 'Registered', 'Deposit Attempt', 'Result', ''],
    rows: [
      row([person('Alex Carter', 'UK-49120', 'AC'), badge('Verified', 'green'), mono('1998-04-22'), badge('28y · OK', 'green'), mono('May 9 · 10:02'), mono('£20'), badge('Pending', 'amber'), action('Review')], ['pending']),
      row([person('Jamie Walsh', 'UK-49118', 'JW'), badge('Verified', 'green'), mono('2005-01-15'), badge('21y · OK', 'green'), mono('May 9 · 09:48'), mono('£10'), badge('Pending', 'amber'), action('Review')], ['pending']),
      row([person('[Blocked]', 'UK-49115', '?'), badge('Verified', 'green'), mono('2008-11-03', 'red'), badge('Under 18 — BLOCKED', 'red'), mono('May 9 · 09:30'), mono('£5'), badge('Blocked', 'red'), { text: '' }], ['failed', 'under18'], true),
      row([person('Priya Mehta', 'UK-49110', 'PM'), badge('Pending', 'amber'), mono('1990-06-14'), badge('35y · OK', 'green'), mono('May 9 · 09:12'), mono('—'), badge('Waiting'), { text: '' }], ['pending']),
      row([person('Lena Park', 'UK-47812', 'LP'), badge('Verified', 'green'), mono('1995-03-08'), badge('31y · OK', 'green'), mono('May 8 · 14:20'), mono('£50'), badge('Pass', 'green'), { text: '' }], ['all']),
      row([person('Jake Morton', 'UK-47401', 'JM'), badge('Verified', 'green'), mono('1999-07-19'), badge('26y · OK', 'green'), mono('May 8 · 12:05'), mono('£30'), badge('Pass', 'green'), { text: '' }], ['all']),
      row([person('[Retry]', 'UK-49108', '?'), badge('Bounced', 'red'), mono('—'), badge('—'), mono('May 8 · 10:44'), mono('—'), badge('Failed', 'red'), action('Retry')], ['failed']),
    ],
  },
  kyc1: {
    title: 'KYC1 Verification', crumbs: ['Compliance', 'KYC1 Verification'],
    primaryAction: 'Sumsub Dashboard', secondaryAction: 'Review Flagged', subtitle: '',
    metrics: [
      metric('Pending KYC1', '138', 'ID + selfie verification', '#ffb627', [90, 96, 102, 108, 112, 116, 120, 124, 128, 130, 133, 135, 137, 138], '12%'),
      metric('Approved Today', '84', '', '#2bd4a1', [50, 55, 58, 62, 66, 70, 74, 76, 78, 80, 82, 83, 84, 84]),
      metric('Rejected / Retry', '22', '', '#ff3b47', [14, 15, 16, 17, 17, 18, 18, 19, 20, 21, 21, 22, 22, 22]),
      metric('Avg Review Time', '8.4m', 'Sumsub AI assisted', '#5b8def', [18, 16, 14, 13, 12, 11.5, 10.5, 10, 9.5, 9, 8.8, 8.6, 8.4, 8.4]),
    ],
    tableTitle: 'KYC1 Queue — Identity Verification',
    tableDescription: 'Sumsub · Passport / Driving Licence + Live Selfie',
    filters: [{ label: 'All', key: 'all' }, { label: 'Manual Review', key: 'manual' }, { label: 'AI Pass', key: 'pass' }, { label: 'Rejected', key: 'retry' }, { label: 'Expired', key: 'expired' }],
    columns: ['User', 'Doc Type', 'Sumsub ID', 'AI Score', 'Submitted', 'Trigger', 'Result', ''],
    rows: [
      row([person('Owen Briggs', 'UK-48588', 'OB'), { text: 'Passport' }, mono('SS-9248'), score(62, '#ffb627'), mono('May 9 · 11:20'), { text: 'Dep £380' }, badge('Manual Review', 'amber'), action('Review', 'red')], ['manual']),
      row([person('Aaron Khouri', 'UK-48820', 'AK'), { text: 'Driving Licence' }, mono('SS-9178'), score(28, '#ff6478'), mono('May 8 · 09:14'), { text: 'High risk' }, badge('Manual Review', 'amber'), action('Review', 'red')], ['manual'], true),
      row([person('Tom Whitlock', 'UK-48994', 'TW'), { text: 'Passport' }, mono('SS-9142'), score(91, '#74e8c0'), mono('May 7 · 14:30'), { text: 'Dep £3,200' }, badge('Approved', 'green'), { text: '' }], ['pass']),
      row([person('Daniel Foster', 'UK-48291', 'DF'), { text: 'Passport' }, mono('SS-9128'), score(96, '#74e8c0'), mono('Apr 12 · 10:00'), { text: 'Dep £1,000' }, badge('Approved', 'green'), { text: '' }], ['pass']),
      row([person('Marcus Reed', 'UK-47821', 'MR'), { text: 'Driving Licence' }, mono('SS-9001'), score(88, '#74e8c0'), mono('Apr 2 · 12:45'), { text: 'Dep £640' }, badge('Approved', 'green'), { text: '' }], ['pass']),
      row([person('Tara Goldsmith', 'UK-47720', 'TG'), { text: 'Passport' }, mono('SS-8944'), score(44, '#ff6478'), mono('Mar 28 · 08:20'), { text: 'Dep £200' }, badge('Retry', 'red'), action('Contact')], ['retry']),
      row([person('Helena Moss', 'UK-48421', 'HM'), { text: 'Passport' }, mono('SS-9200'), score(82, '#74e8c0'), mono('May 6 · 16:10'), { text: 'RG flag' }, badge('Approved', 'green'), { text: '' }], ['pass']),
    ],
  },
  aml: {
    title: 'AML Monitoring', crumbs: ['Compliance', 'AML Monitoring'],
    primaryAction: 'Export SAR Draft', secondaryAction: 'Escalate to MLRO', subtitle: '',
    metrics: [
      metric('High-Risk Users', '42', 'AML score ≥75', '#ff3b47', [28, 30, 32, 34, 36, 37, 38, 39, 40, 40, 41, 41, 42, 42], '8%'),
      metric('Open Cases', '14', '8 pending MLRO review', '#ffb627', [8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 13, 14, 14, 14]),
      metric('SARs Filed (30d)', '3', '', '#a78bfa', [0, 0, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3]),
      metric('Avg Case Age', '6.2d', 'target <10d', '#2bd4a1', [12, 11, 10, 9.5, 9, 8.5, 8, 7.5, 7, 6.8, 6.5, 6.3, 6.2, 6.2]),
    ],
    tableTitle: 'AML Risk Monitoring',
    tableDescription: 'Automated scoring · transaction pattern analysis · MLRO escalation',
    filters: [{ label: 'All', key: 'all' }, { label: 'High Risk', key: 'high' }, { label: 'Medium', key: 'medium' }, { label: 'Open Cases', key: 'open' }, { label: 'SAR Filed', key: 'sar' }],
    columns: ['User', 'AML Score', 'Trigger', 'Case', 'Flagged', 'MLRO', 'SAR', 'Status'],
    rows: [
      row([person('Aaron Khouri', 'UK-48820', 'AK', true), score(94, '#ff3b47'), { text: 'Multi-account + rapid W/D' }, mono('CMP-9178', 'blue'), mono('May 8'), { text: 'Harman M.' }, mono('—'), badge('Open', 'red')], ['high', 'open'], true),
      row([person('Tom Whitlock', 'UK-48994', 'TW', true), score(86, '#ff3b47'), { text: 'Deposit pattern £3,200' }, mono('CMP-9142', 'blue'), mono('May 4'), { text: 'Harman M.' }, badge('Pending', 'amber'), badge('Open', 'red')], ['high', 'open'], true),
      row([person('Owen Briggs', 'UK-48588', 'OB'), score(72, '#ffb627'), { text: 'Rapid withdrawal after win' }, mono('CMP-9248', 'blue'), mono('May 9'), { text: 'Unassigned', tone: 'red' }, mono('—'), badge('Review', 'amber')], ['medium']),
      row([person('[Redacted]', 'UK-47120', '?', true), score(98, '#ff3b47'), { text: 'Structuring — 10× £190 deposits' }, mono('CMP-9001', 'blue'), mono('Jan 2026'), { text: 'Harman M.' }, badge('SAR Filed', 'red'), badge('SAR', 'red')], ['high', 'sar'], true),
      row([person('Helena Moss', 'UK-48421', 'HM'), score(44, '#2bd4a1'), { text: 'Periodic screening' }, mono('—'), mono('May 6'), mono('—'), mono('—'), badge('Clear', 'green')], ['all']),
      row([person('Marcus Reed', 'UK-47821', 'MR'), score(38, '#2bd4a1'), { text: 'Withdrawal £640' }, mono('—'), mono('Apr 2'), mono('—'), mono('—'), badge('Clear', 'green')], ['all']),
      row([person('Daniel Foster', 'UK-48291', 'DF'), score(24, '#2bd4a1'), { text: 'Periodic screening' }, mono('—'), mono('Apr 12'), mono('—'), mono('—'), badge('Clear', 'green')], ['all']),
    ],
  },
  sof: {
    title: 'Source of Funds (SoF)', crumbs: ['Compliance', 'Source of Funds'],
    primaryAction: 'Export Pending', secondaryAction: 'Chase Overdue', subtitle: '',
    metrics: [
      metric('SoF Requests Open', '24', 'avg 12.4 days open', '#ffb627', [14, 15, 16, 17, 18, 19, 20, 21, 22, 22, 23, 23, 24, 24], '6%'),
      metric('Pending > 30 days', '8', 'accounts restricted', '#ff3b47', [2, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8]),
      metric('Cleared (30d)', '42', '', '#2bd4a1', [28, 30, 32, 34, 36, 37, 38, 39, 40, 40, 41, 41, 42, 42]),
      metric('Total Funds Reviewed', '£284K', '', '#5b8def', [200, 212, 224, 236, 248, 256, 264, 272, 276, 280, 282, 283, 284, 284]),
    ],
    tableTitle: 'Source of Funds Cases',
    tableDescription: 'Triggered at deposit threshold or AML referral',
    filters: [{ label: 'All', key: 'all' }, { label: 'Pending', key: 'pending' }, { label: 'Evidence Received', key: 'evidence' }, { label: 'Overdue', key: 'overdue' }, { label: 'Cleared', key: 'cleared' }],
    columns: ['User', 'Trigger', 'Amount', 'Requested', 'Evidence', 'Age', 'Reviewer', 'Status'],
    rows: [
      row([person('Tom Whitlock', 'UK-48994', 'TW'), { text: 'Dep pattern £3,200' }, mono('£3,200'), mono('May 4'), { text: 'Salary slip pending', tone: 'amber' }, mono('7d'), { text: 'Harman M.' }, badge('Pending', 'amber')], ['pending']),
      row([person('Aaron Khouri', 'UK-48820', 'AK'), { text: 'AML case CMP-9178' }, mono('£4,400'), mono('May 2'), { text: 'None received', tone: 'muted' }, mono('9d'), { text: 'Harman M.' }, badge('Overdue', 'red')], ['overdue'], true),
      row([person('[Restricted]', 'UK-47820', '?', true), { text: 'Cumulative £8,400' }, mono('£8,400'), mono('Apr 8'), { text: 'None received', tone: 'muted' }, mono('33d'), { text: 'Mei S.' }, badge('Restricted', 'red')], ['overdue'], true),
      row([person('Owen Briggs', 'UK-48588', 'OB'), { text: 'Rapid W/D pattern' }, mono('£380'), mono('May 9'), mono('—'), mono('1d'), { text: 'Unassigned', tone: 'red' }, badge('New', 'amber')], ['pending']),
      row([person('Helena Moss', 'UK-48421', 'HM'), { text: 'AML flag' }, mono('£1,200'), mono('Apr 20'), { text: 'Bank statement received', tone: 'amber' }, mono('21d'), { text: 'Jordan D.' }, badge('Evidence In', 'violet')], ['evidence']),
      row([person('Marcus Reed', 'UK-47821', 'MR'), { text: 'Dep £640 + pattern' }, mono('£640'), mono('Apr 2'), { text: 'Payslip approved', tone: 'green' }, mono('39d'), { text: 'Sara K.' }, badge('Cleared', 'green')], ['cleared']),
      row([person('Karl Vincent', 'UK-48109', 'KV'), { text: 'Cumulative £2,400' }, mono('£2,400'), mono('Mar 28'), { text: 'Bank statements approved', tone: 'green' }, mono('44d'), { text: 'Sara K.' }, badge('Cleared', 'green')], ['cleared']),
    ],
  },
  pep: {
    title: 'PEP & Sanctions', crumbs: ['Compliance', 'PEP & Sanctions'],
    primaryAction: 'Run Screening', secondaryAction: 'Escalate Matches', subtitle: '',
    metrics: [
      metric('PEP Users', '12', 'Enhanced due diligence active', '#ffb627', [8, 9, 9, 10, 10, 11, 11, 11, 12, 12, 12, 12, 12, 12]),
      metric('Sanctions Matches', '2', 'Blocked · OFAC/EU/UN', '#ff3b47', [0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2]),
      metric('Last Screening', '2h ago', 'Daily automated run', '#2bd4a1', []),
      metric('False Positives (30d)', '8', 'Cleared after review', '#5b8def', [4, 4, 5, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 8]),
    ],
    tableTitle: 'PEP & Sanctions Screening',
    tableDescription: 'Automated daily screening · Refinitiv World-Check · OFAC / EU / UN lists',
    filters: [{ label: 'All', key: 'all' }, { label: 'PEP', key: 'pep' }, { label: 'Sanctions', key: 'sanctions' }, { label: 'False Positive', key: 'false-positive' }, { label: 'Clear', key: 'clear' }],
    columns: ['User', 'Category', 'Match Score', 'Source List', 'Flagged', 'EDD Status', 'Reviewer', 'Status'],
    rows: [
      row([person('[Blocked]', 'UK-49200', '⊘', true), badge('Sanctions', 'red'), score(99, '#ff3b47'), mono('OFAC SDN'), mono('May 9'), { text: 'N/A — blocked' }, { text: 'System' }, badge('Blocked', 'red')], ['sanctions'], true),
      row([person('[Blocked]', 'UK-49180', '⊘', true), badge('Sanctions', 'red'), score(97, '#ff3b47'), mono('EU List'), mono('Apr 22'), { text: 'N/A — blocked' }, { text: 'Harman M.' }, badge('Blocked', 'red')], ['sanctions'], true),
      row([person('John Hargreaves', 'UK-48200', 'JH'), badge('PEP Tier 1', 'amber'), score(88, '#ffb627'), mono('WC-PEP'), mono('Mar 10'), { text: 'In progress' }, { text: 'Harman M.' }, badge('EDD Active', 'amber')], ['pep']),
      row([person('Maria Castillo', 'UK-47950', 'MC'), badge('PEP Tier 2', 'amber'), score(76, '#ffb627'), mono('WC-PEP'), mono('Feb 18'), { text: 'EDD complete' }, { text: 'Mei S.' }, badge('Cleared', 'green')], ['pep']),
      row([person('David Okafor', 'UK-48400', 'DO'), badge('PEP Tier 1', 'amber'), score(84, '#ffb627'), mono('WC-PEP'), mono('Apr 5'), { text: 'In progress' }, { text: 'Harman M.' }, badge('EDD Active', 'amber')], ['pep']),
      row([person('Peter Novak', 'UK-48120', 'PN'), badge('False Positive', 'green'), score(42, '#5b8def'), mono('WC-PEP'), mono('May 1'), mono('N/A'), { text: 'Jordan D.' }, badge('False Pos.')], ['false-positive']),
      row([person('Sara Park', 'UK-49021', 'SP'), badge('False Positive', 'green'), score(38, '#5b8def'), mono('WC-PEP'), mono('Apr 28'), mono('N/A'), { text: 'Sara K.' }, badge('False Pos.')], ['false-positive']),
    ],
  },
  suspicious: {
    title: 'Suspicious Activities', crumbs: ['Compliance', 'Suspicious Activities'],
    primaryAction: 'Draft SAR', secondaryAction: 'File SAR to UKGC', subtitle: '',
    metrics: [
      metric('Open Suspicious Flags', '14', '8 pending MLRO decision', '#ff3b47', [8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 14], '17%'),
      metric('SARs Filed (YTD)', '8', '3 in last 30 days', '#ffb627', [2, 3, 3, 4, 4, 5, 5, 5, 6, 6, 7, 7, 8, 8]),
      metric('Tipping-Off Risk', '2', 'Active investigations · comms restricted', '#ff3b47', [0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2]),
      metric('Resolved (30d)', '22', '', '#2bd4a1', [14, 15, 16, 17, 17, 18, 18, 19, 20, 21, 21, 22, 22, 22]),
    ],
    tableTitle: 'Suspicious Activity Reports',
    tableDescription: 'UKGC / NCA · POCA 2002 · tipping-off restrictions apply',
    filters: [{ label: 'All', key: 'all' }, { label: 'Open', key: 'open' }, { label: 'SAR Filed', key: 'filed' }, { label: 'MLRO Review', key: 'mlro' }, { label: 'Closed', key: 'closed' }],
    columns: ['Ref', 'User', 'Activity Type', 'Flagged', 'MLRO', 'SAR Ref', 'Tip-Off', 'Status'],
    rows: [
      row([mono('SAR-2026-008', 'blue'), person('Aaron Khouri', 'UK-48820', 'AK'), { text: 'Multi-account + structuring' }, mono('May 8'), { text: 'Harman M.' }, badge('Pending', 'amber'), badge('⚠ Active', 'red'), badge('MLRO Review', 'amber')], ['mlro'], true),
      row([mono('SAR-2026-007', 'blue'), person('[Redacted]', 'UK-47120', '?'), { text: 'Repeated structuring £190×10' }, mono('Jan 2026'), { text: 'Harman M.' }, mono('SAR-NCA-4821', 'green'), mono('—'), badge('SAR Filed', 'violet')], ['filed']),
      row([mono('SAR-2026-006', 'blue'), person('Tom Whitlock', 'UK-48994', 'TW'), { text: 'SoF mismatch + deposit pattern' }, mono('May 4'), { text: 'Harman M.' }, mono('—'), badge('⚠ Active', 'red'), badge('Open', 'red')], ['open'], true),
      row([mono('SAR-2026-005', 'blue'), person('[Redacted]', 'UK-49200', '?'), { text: 'Sanctions hit · OFAC SDN' }, mono('May 9'), { text: 'System auto', tone: 'violet' }, mono('SAR-NCA-4920', 'green'), badge('⚠ Active', 'red'), badge('SAR Filed', 'violet')], ['filed'], true),
      row([mono('SAR-2026-004', 'blue'), person('[Redacted]', 'UK-47820', '?'), { text: 'SoF non-response + AML' }, mono('Apr 8'), { text: 'Mei S.' }, mono('SAR-NCA-4800', 'green'), mono('—'), badge('SAR Filed', 'violet')], ['filed']),
      row([mono('SAR-2026-003', 'blue'), person('Karl Vincent', 'UK-48109', 'KV'), { text: 'Unusual win pattern' }, mono('Mar 22'), { text: 'Mei S.' }, mono('—'), mono('—'), badge('Closed', 'green')], ['closed']),
      row([mono('SAR-2026-002', 'blue'), person('Owen Briggs', 'UK-48588', 'OB'), { text: 'Rapid W/D after deposit' }, mono('May 9'), { text: 'Unassigned', tone: 'red' }, mono('—'), mono('—'), badge('Open', 'red')], ['open']),
    ],
  },
};

export const getCompliancePage = (view: string): CompliancePage => pages[view] || pages['cases'];
