import { Component } from '@angular/core';

interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  direction: 'up' | 'down';
  subtitle: string;
  color: 'red' | 'green' | 'blue' | 'amber';
  spark: number[];
}

interface MatchRow {
  home: string;
  away: string;
  series: string;
  time: string;
  contests: number;
  prize: string;
  fill: number;
  status: 'live' | 'open' | 'upcoming';
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  readonly metrics: DashboardMetric[] = [
    {
      label: 'Active Users (30d)',
      value: '38,412',
      change: '12.4%',
      direction: 'up',
      subtitle: '48,206 registered · 79.7% active',
      color: 'red',
      spark: [25, 38, 34, 47, 57, 50, 66, 75, 68, 83, 91, 100, 95, 100],
    },
    {
      label: 'Net Operator Revenue',
      value: '£284.6K',
      change: '8.2%',
      direction: 'up',
      subtitle: 'After Stripe + Sumsub + Bonus',
      color: 'green',
      spark: [20, 32, 27, 40, 48, 44, 58, 68, 63, 76, 88, 83, 96, 100],
    },
    {
      label: 'Total Deposits',
      value: '£1.42M',
      change: '6.1%',
      direction: 'up',
      subtitle: 'Withdrawals £612K · 43.1%',
      color: 'blue',
      spark: [44, 41, 49, 59, 54, 64, 71, 66, 77, 84, 82, 93, 98, 100],
    },
    {
      label: 'Compliance Queue',
      value: '214',
      change: '3.2%',
      direction: 'down',
      subtitle: '62 KYC0 · 138 KYC1 · 14 SoF',
      color: 'amber',
      spark: [34, 40, 37, 48, 45, 54, 50, 62, 58, 55, 68, 64, 75, 78],
    },
  ];

  readonly chartGrid = [
    { y: 25, label: '40K' },
    { y: 57, label: '30K' },
    { y: 89, label: '20K' },
    { y: 121, label: '10K' },
    { y: 153, label: '0' },
  ];

  readonly activitySeries = [
    this.createSeries(
      '#FF3B47',
      [8400, 9200, 8600, 10400, 11200, 10800, 12100, 11800, 13200, 12800, 13600, 14000, 13800, 14206],
      true,
    ),
    this.createSeries(
      '#5B8DEF',
      [18000, 17400, 18800, 19600, 20400, 19800, 21200, 22000, 23400, 22800, 24200, 25400, 26800, 27440],
      true,
    ),
    this.createSeries(
      '#A78BFA',
      [28000, 28600, 29400, 30200, 31000, 32400, 33800, 34200, 35600, 36400, 37200, 37800, 38100, 38412],
      false,
    ),
  ];

  readonly riskLevels = [
    { label: 'Self Excluded', value: '48', percent: 12, color: '#FF3B47' },
    { label: 'High-Risk', value: '27', percent: 7, color: '#FF6478' },
    { label: 'Monthly Loss', value: '184', percent: 46, color: '#FFB627' },
    { label: 'At Limit', value: '312', percent: 78, color: '#5B8DEF' },
    { label: 'Healthy Players', value: '37,841', percent: 94, color: '#2BD4A1' },
  ];

  readonly matches: MatchRow[] = [
    { home: 'Arsenal', away: 'Liverpool', series: 'Premier League', time: "LIVE 78'", contests: 84, prize: '£42,800', fill: 92, status: 'live' },
    { home: 'Chelsea', away: 'Man City', series: 'Premier League', time: '20:00 BST', contests: 62, prize: '£38,200', fill: 78, status: 'open' },
    { home: 'Real Madrid', away: 'Bayern', series: 'Champions Lge', time: '20:00 CET', contests: 48, prize: '£31,400', fill: 64, status: 'open' },
    { home: 'Spurs', away: 'Newcastle', series: 'FA Cup', time: 'Tomorrow', contests: 22, prize: '£12,200', fill: 34, status: 'upcoming' },
  ];

  readonly balances = [
    { label: 'Total User Funds', value: '£3.84M', percent: 62, color: '#5B8DEF' },
    { label: 'Operator Funds', value: '£924K', percent: 18, color: '#FF3B47' },
    { label: 'Locked / In-play', value: '£412K', percent: 9, color: '#FFB627' },
    { label: 'Withdrawable', value: '£612K', percent: 11, color: '#2BD4A1' },
    { label: 'Dormant Funds', value: '£68K', percent: 3, color: '#7A839E' },
  ];

  readonly approvals = [
    { icon: '₿', label: 'Withdrawals', count: 24, priority: '3 flagged' },
    { icon: '✓', label: 'Contest Reviews', count: 8, priority: '' },
    { icon: '!', label: 'Suspensions', count: 5, priority: '2 escalated' },
    { icon: '×', label: 'Account Deletion', count: 3, priority: '' },
    { icon: '◐', label: 'Compliance', count: 1, priority: 'SoF' },
  ];

  private createSeries(color: string, values: number[], fill: boolean) {
    const points = values.map((value, index) => {
      const x = 38 + (index / (values.length - 1)) * 632;
      const y = 153 - (value / 40000) * 128;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point}`).join(' ');
    const firstX = points[0].split(',')[0];
    const lastX = points[points.length - 1].split(',')[0];

    return {
      color,
      fill,
      path,
      area: `${path} L${lastX},153 L${firstX},153 Z`,
    };
  }
}
