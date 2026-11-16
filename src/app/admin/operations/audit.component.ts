import { Component } from '@angular/core';
import { OpsMetric } from './ops-metric-card.component';

interface AuditEntry {
  time: string;
  admin: string;
  initials: string;
  role: string;
  action: string;
  target: string;
  before: string;
  after: string;
  ip: string;
  category: string;
  tone: string;
  highlight?: boolean;
}

@Component({
  selector: 'app-audit',
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.css'],
})
export class AuditComponent {
  readonly metrics: OpsMetric[] = [
    { label: 'Admin Actions (24h)', value: '1,284', detail: '42 financial · 18 KYC · 9 RG', color: '#5b8def', spark: [40, 52, 48, 62, 58, 72, 68, 82, 76, 88, 92, 88, 98, 104] },
    { label: 'Active Sessions', value: '14', detail: 'of 38 admins · 2 expiring', color: '#2bd4a1', spark: [10, 12, 11, 13, 12, 14, 15, 13, 14, 14, 12, 13, 14, 14] },
    { label: 'Failed Logins (24h)', value: '9', change: '3', direction: 'down', detail: '2 IPs blocked · all 2FA-passed', color: '#ffb627', spark: [12, 14, 11, 10, 12, 9, 11, 8, 9, 10, 9, 8, 9, 9] },
    { label: '2FA Coverage', value: '100%', detail: '38 of 38 admins · enforced', color: '#a78bfa', spark: [88, 92, 94, 96, 98, 100, 100, 100, 100, 100, 100, 100, 100, 100] },
  ];

  readonly entries: AuditEntry[] = [
    { time: '10:42:18', admin: 'Mei Sato', initials: 'MS', role: 'Compliance', action: 'Approve KYC1', target: 'UK-48291 · Daniel Foster', before: '—', after: 'Approved', ip: '88.156.42.18', category: 'KYC', tone: 'violet' },
    { time: '10:38:02', admin: 'Harman Mehta', initials: 'HM', role: 'Super Admin', action: 'Suspend account', target: 'UK-48820 · Aaron Khouri', before: 'Active', after: 'Suspended', ip: '81.130.10.4', category: 'Security', tone: 'red', highlight: true },
    { time: '10:32:55', admin: 'Jordan Doyle', initials: 'JD', role: 'Finance', action: 'Approve withdrawal', target: 'TX-9182AA · £200.00', before: 'Pending', after: 'Cleared', ip: '88.156.42.21', category: 'Financial', tone: 'blue' },
    { time: '10:28:14', admin: 'Mei Sato', initials: 'MS', role: 'Compliance', action: 'Open compliance case', target: 'CMP-9182 · Rebecca Hale', before: '—', after: 'Investigating', ip: '88.156.42.18', category: 'KYC', tone: 'violet' },
    { time: '10:22:09', admin: 'System (RG)', initials: 'SY', role: 'Automation', action: 'Flag Monthly Loss user', target: 'UK-48211 · Hannah Wells', before: 'Normal', after: 'Monthly Loss · 5mo', ip: '—', category: 'RG', tone: 'pink' },
    { time: '10:18:31', admin: 'Jordan Doyle', initials: 'JD', role: 'Finance', action: 'Adjust contest fee', target: 'Mega Contest · MD36', before: '12%', after: '15%', ip: '88.156.42.21', category: 'Financial', tone: 'blue' },
    { time: '10:14:02', admin: 'Sasha Arnaud', initials: 'SA', role: 'Marketing', action: 'Publish bonus campaign', target: 'Champions Lge Boost', before: 'Draft', after: 'Live', ip: '88.156.42.32', category: 'Financial', tone: 'blue' },
    { time: '10:08:44', admin: 'Mei Sato', initials: 'MS', role: 'Compliance', action: 'Reject KYC1', target: 'UK-48994 · selfie unclear', before: 'Pending', after: 'Rejected', ip: '88.156.42.18', category: 'KYC', tone: 'violet' },
    { time: '10:02:11', admin: 'Harman Mehta', initials: 'HM', role: 'Super Admin', action: 'Update RG policy', target: 'Policy v1.3 → v1.4', before: 'v1.3', after: 'v1.4 (force re-consent)', ip: '81.130.10.4', category: 'RG', tone: 'pink' },
  ];

  readonly roles = [
    { name: 'Super Admin', note: 'Full access · 2FA', count: 2, color: '#ff3b47' },
    { name: 'Finance Admin', note: 'Wallet · withdrawals', count: 6, color: '#5b8def' },
    { name: 'Compliance Admin', note: 'KYC · AML · cases', count: 8, color: '#a78bfa' },
    { name: 'Support Admin', note: 'Tickets · disputes', count: 18, color: '#ffb627' },
    { name: 'Marketing Admin', note: 'Bonuses · banners', count: 4, color: '#2bd4a1' },
  ];

  readonly sessions = [
    { initials: 'HM', name: 'Harman Mehta', device: 'Mac · Chrome', location: 'London', duration: '2h 14m', current: true },
    { initials: 'MS', name: 'Mei Sato', device: 'Mac · Safari', location: 'London', duration: '1h 48m' },
    { initials: 'JD', name: 'Jordan Doyle', device: 'Win · Edge', location: 'Manchester', duration: '58m' },
    { initials: 'SA', name: 'Sasha Arnaud', device: 'Mac · Chrome', location: 'Paris', duration: '24m' },
  ];
}
