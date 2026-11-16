import { Component } from '@angular/core';
import { OpsMetric } from './ops-metric-card.component';

interface Subscriber {
  name: string;
  id: string;
  initials: string;
  plan: string;
  started: string;
  expires: string;
  expiryTone: string;
  autoRenew: boolean;
  lifetimeSpend: string;
  engagement: number;
  status: string;
}

@Component({
  selector: 'app-subscription-analytics',
  templateUrl: './subscription-analytics.component.html',
  styleUrls: ['./subscription-analytics.component.css'],
})
export class SubscriptionAnalyticsComponent {
  readonly metrics: OpsMetric[] = [
    { label: 'Total Subscribers', value: '8,612', change: '11.4%', detail: '6,420 active · 1,420 expired', color: '#a78bfa', spark: [58, 60, 62, 64, 66, 68, 70, 72, 74, 77, 80, 82, 84, 86] },
    { label: 'Subscription Revenue', value: '£94,212', change: '12.1%', detail: 'MTD · target £108K (87%)', color: '#ff3b47', spark: [58, 62, 66, 68, 72, 76, 80, 82, 85, 88, 90, 92, 93, 94] },
    { label: 'Renewal Rate', value: '74.2%', change: '2.4%', detail: '3-mo plan converts 82%', color: '#2bd4a1', spark: [68, 69, 70, 71, 71, 72, 72, 73, 73, 73, 74, 74, 74, 74] },
    { label: 'Expiring (7d)', value: '284', change: '6%', direction: 'down', detail: 'auto-renew off · push reminder', color: '#ffb627', spark: [21, 22, 23, 24, 25, 26, 27, 27, 28, 28, 28, 28, 28, 28] },
  ];

  readonly plans = [
    { name: '1 Month', tag: 'Most popular', price: '£9.99', color: '#ff3b47', subscribers: '4,220', share: 65.7, revenue: '£42,160', renewal: 68 },
    { name: '3 Month', tag: 'Best LTV', price: '£24.99', color: '#a78bfa', subscribers: '2,200', share: 34.3, revenue: '£52,052', renewal: 82 },
  ];

  readonly subscribers: Subscriber[] = [
    { name: 'Daniel Foster', id: 'UK-48291', initials: 'DF', plan: '3 Month', started: 'Feb 9, 2026', expires: 'May 9 (today)', expiryTone: 'red', autoRenew: false, lifetimeSpend: '£74.97', engagement: 92, status: 'Pending Renewal' },
    { name: 'Sara Park', id: 'UK-49021', initials: 'SP', plan: '1 Month', started: 'Apr 9, 2026', expires: 'May 9 (today)', expiryTone: 'red', autoRenew: true, lifetimeSpend: '£29.97', engagement: 68, status: 'Active' },
    { name: 'Helena Moss', id: 'UK-48421', initials: 'HM', plan: '1 Month', started: 'Apr 11, 2026', expires: 'May 11 (in 2d)', expiryTone: 'amber', autoRenew: false, lifetimeSpend: '£9.99', engagement: 42, status: 'Expiring' },
    { name: 'Jonas Reid', id: 'UK-48402', initials: 'JR', plan: '3 Month', started: 'Feb 14, 2026', expires: 'May 14 (in 5d)', expiryTone: '', autoRenew: true, lifetimeSpend: '£99.96', engagement: 84, status: 'Active' },
    { name: 'Imogen Ash', id: 'UK-48710', initials: 'IA', plan: '1 Month', started: 'Apr 14, 2026', expires: 'May 14 (in 5d)', expiryTone: '', autoRenew: false, lifetimeSpend: '£9.99', engagement: 28, status: 'Expiring' },
    { name: 'Marcus Reed', id: 'UK-47821', initials: 'MR', plan: '3 Month', started: 'Feb 16, 2026', expires: 'May 16 (in 7d)', expiryTone: '', autoRenew: false, lifetimeSpend: '£74.97', engagement: 72, status: 'Expiring' },
  ];

  readonly cohortMonths = ['M0', 'M1', 'M2', 'M3', 'M4', 'M5'];
  readonly cohorts: Array<{ month: string; retention: Array<number | null> }> = [
    { month: 'Dec', retention: [100, 78, 64, 56, 49, 42] },
    { month: 'Jan', retention: [100, 80, 66, 58, 50, 44] },
    { month: 'Feb', retention: [100, 82, 68, 60, 52, null] },
    { month: 'Mar', retention: [100, 84, 70, 62, null, null] },
    { month: 'Apr', retention: [100, 86, 72, null, null, null] },
    { month: 'May', retention: [100, 88, null, null, null, null] },
  ];

  engagementTone(value: number): string {
    return value >= 70 ? '#2bd4a1' : value >= 40 ? '#ffb627' : '#ff3b47';
  }
}
