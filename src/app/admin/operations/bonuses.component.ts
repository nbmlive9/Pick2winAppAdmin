import { Component } from '@angular/core';
import { OpsMetric } from './ops-metric-card.component';

interface BonusProgram {
  name: string;
  type: string;
  color: string;
  recipients: string;
  distributed: string;
  used: string;
  conversion: number;
}

@Component({
  selector: 'app-bonuses',
  templateUrl: './bonuses.component.html',
  styleUrls: ['./bonuses.component.css'],
})
export class BonusesComponent {
  readonly metrics: OpsMetric[] = [
    { label: 'Bonus Distributed (MTD)', value: '£42,180', change: '6.2%', detail: '924 users · avg £45.6', color: '#a78bfa', spark: [18, 22, 24, 28, 32, 30, 34, 36, 38, 40, 41, 42, 42, 42] },
    { label: 'Active Bonus Balances', value: '£18,640', detail: 'Across 1,420 users', color: '#5b8def', spark: [10, 12, 11, 13, 14, 15, 16, 17, 17, 18, 18, 18, 18, 19] },
    { label: 'Referral Conversions', value: '284', change: '14%', detail: 'of 612 invites · 46.4%', color: '#ff3b47', spark: [140, 160, 180, 200, 220, 240, 250, 260, 270, 275, 278, 280, 282, 284] },
    { label: 'Abuse Flags', value: '9', change: '11%', direction: 'down', detail: '2 confirmed · 7 investigating', color: '#ffb627', spark: [14, 13, 12, 11, 12, 11, 10, 11, 10, 10, 9, 9, 9, 9] },
  ];

  readonly programs: BonusProgram[] = [
    { name: 'Welcome £10', type: 'Joining', color: '#ff3b47', recipients: '1,840', distributed: '£18,400', used: '£14,720', conversion: 80 },
    { name: 'Refer-a-Mate £20', type: 'Referral', color: '#a78bfa', recipients: '284', distributed: '£5,680', used: '£3,920', conversion: 69 },
    { name: 'Sub Welcome £15', type: 'Subscription', color: '#5b8def', recipients: '612', distributed: '£9,180', used: '£6,840', conversion: 75 },
    { name: 'Weekly Cashback 5%', type: 'Cashback', color: '#2bd4a1', recipients: '3,420', distributed: '£6,820', used: '£4,640', conversion: 68 },
    { name: 'Champions Lge Boost', type: 'Promotional', color: '#ffb627', recipients: '124', distributed: '£1,860', used: '£1,240', conversion: 67 },
    { name: 'Loyalty Tier Up', type: 'Loyalty', color: '#ff6478', recipients: '48', distributed: '£240', used: '£140', conversion: 58 },
  ];

  readonly abuseFlags = [
    { severity: 'high', text: 'Priya Shastri — 14 referrals same IP/device' },
    { severity: 'high', text: 'Aaron K. — 4 accounts share Stripe card' },
    { severity: 'medium', text: 'Burst signup: 12 accounts in 4 min from /promo' },
    { severity: 'medium', text: 'Bonus → withdraw cycle (3.1× avg) on 6 accts' },
    { severity: 'low', text: 'Welcome bonus claimed via VPN endpoints' },
  ];
}
