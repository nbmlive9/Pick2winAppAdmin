import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/core/services/admin.service';

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
export class DashboardComponent implements OnInit {
  homeData: any = null;
  constructor(private api: AdminService) {}

  ngOnInit(): void {
    this.api
      .getDashboardHome()
      .subscribe((res: any) => (this.homeData = res?.data ?? null));
  }

  private number(value: number | null | undefined): string {
    return new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(
      value ?? 0,
    );
  }

  private money(value: number | null | undefined): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(value ?? 0);
  }

  private spark(value: number | undefined): number[] {
    const finalPoint = Math.max(8, Math.min(100, value ?? 0));
    return [25, 38, 34, 47, 57, 50, 66, 75, 68, 83, 91, 100, 95, finalPoint];
  }

  get metrics(): DashboardMetric[] {
    const users = this.homeData?.users ?? {};
    const finance = this.homeData?.finance ?? {};
    const queue = this.homeData?.compliance_queue ?? {};
    return [
      {
        label: 'Active Users (30d)',
        value: this.number(users.active_30d),
        change: `${users.active_pct ?? 0}%`,
        direction: 'up',
        subtitle: `${this.number(users.total_registered)} registered`,
        color: 'red',
        spark: this.spark(users.active_30d),
      },
      {
        label: 'Net Operator Revenue',
        value: this.money(finance.net_operator_revenue),
        change: `${this.money(finance.total_costs)} costs`,
        direction: 'up',
        subtitle: 'After fees and bonuses',
        color: 'green',
        spark: this.spark(finance.net_operator_revenue),
      },
      {
        label: 'Total Deposits',
        value: this.money(finance.total_deposits),
        change: `${this.money(finance.total_withdrawals)} withdrawn`,
        direction: 'up',
        subtitle: `Withdrawal ratio ${finance.withdrawal_ratio ?? 0}%`,
        color: 'blue',
        spark: this.spark(finance.total_deposits),
      },
      {
        label: 'Compliance Queue',
        value: this.number(queue.total),
        change: `${this.number(queue.sof_open)} SoF`,
        direction: 'down',
        subtitle: `${queue.kyc0_pending ?? 0} KYC0 · ${queue.kyc1_pending ?? 0} KYC1 · ${queue.aml_open ?? 0} AML`,
        color: 'amber',
        spark: this.spark(queue.total),
      },
    ];
  }

  get chartGrid() {
    const rows = this.homeData?.activity?.series ?? [];
    const max = Math.max(
      0,
      ...rows.flatMap((row: any) => [row.dau ?? 0, row.wau ?? 0, row.mau ?? 0]),
    );
    return [1, 0.75, 0.5, 0.25, 0].map((ratio, index) => ({
      y: 25 + index * 32,
      label: this.number(max * ratio),
    }));
  }

  get activityTotals() {
    const activity = this.homeData?.activity ?? {};
    return {
      dau: activity.dau ?? 0,
      wau: activity.wau ?? 0,
      mau: activity.mau ?? 0,
    };
  }

  get activitySeries() {
    const rows = this.homeData?.activity?.series ?? [];
    if (!rows.length) return [];
    const max = Math.max(
      1,
      ...rows.flatMap((row: any) => [row.dau ?? 0, row.wau ?? 0, row.mau ?? 0]),
    );
    return [
      this.createSeries(
        '#FF3B47',
        rows.map((row: any) => Number(row.dau) || 0),
        true,
        max,
      ),
      this.createSeries(
        '#5B8DEF',
        rows.map((row: any) => Number(row.wau) || 0),
        true,
        max,
      ),
      this.createSeries(
        '#A78BFA',
        rows.map((row: any) => Number(row.mau) || 0),
        false,
        max,
      ),
    ];
  }

  get activityDates(): string[] {
    const rows = this.homeData?.activity?.series ?? [];
    if (!rows.length) return [];
    return [
      rows[0].date,
      rows[Math.floor((rows.length - 1) / 2)].date,
      rows[rows.length - 1].date,
    ];
  }

  get userMix() {
    return this.homeData?.user_mix ?? [];
  }

  get rangeLabel(): string {
    const range = this.homeData?.range;
    if (!range?.from || !range?.to) return 'Dashboard';
    const from = new Date(range.from.replace(' ', 'T')).toLocaleDateString(
      'en-GB',
    );
    const to = new Date(range.to.replace(' ', 'T')).toLocaleDateString('en-GB');
    return `${from} – ${to}`;
  }

  get mixGradient(): string {
    const colors = ['#FF3B47', '#A78BFA', '#7A839E'];
    let edge = 0;
    const stops = this.userMix.map((item: any, index: number) => {
      const start = edge;
      edge += Number(item.pct) || 0;
      return `${colors[index % colors.length]} ${start}% ${edge}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  }

  get riskLevels() {
    const risk = this.homeData?.rg_pyramid ?? {};
    const total = Math.max(1, this.homeData?.users?.total_registered ?? 0);
    return [
      {
        label: 'Self Excluded',
        value: this.number(risk.self_excluded),
        percent: ((risk.self_excluded ?? 0) / total) * 100,
        color: '#FF3B47',
      },
      {
        label: 'High-Risk',
        value: this.number(risk.high_risk),
        percent: ((risk.high_risk ?? 0) / total) * 100,
        color: '#FF6478',
      },
      {
        label: 'Monthly Loss',
        value: this.number(risk.monthly_loss),
        percent: ((risk.monthly_loss ?? 0) / total) * 100,
        color: '#FFB627',
      },
      {
        label: 'At Limit',
        value: this.number(risk.at_limit),
        percent: ((risk.at_limit ?? 0) / total) * 100,
        color: '#5B8DEF',
      },
      {
        label: 'Healthy Players',
        value: this.number(risk.healthy_players),
        percent: ((risk.healthy_players ?? 0) / total) * 100,
        color: '#2BD4A1',
      },
    ];
  }

  get matches(): MatchRow[] {
    return (this.homeData?.live_ops?.matches ?? []).map((match: any) => ({
      home: match.home ?? match.home_team ?? match.name ?? '—',
      away: match.away ?? match.away_team ?? '',
      series: match.series ?? match.competition ?? '—',
      time: match.time ?? match.starts_at ?? '—',
      contests: match.contests ?? match.contest_count ?? 0,
      prize: this.money(match.prize ?? match.prize_pool ?? 0),
      fill: Math.min(100, match.fill ?? 0),
      status:
        match.status === 'live'
          ? 'live'
          : match.status === 'open'
            ? 'open'
            : 'upcoming',
    }));
  }

  get balances() {
    const wallet = this.homeData?.wallet_monitor ?? {};
    const total = Math.max(1, Math.abs(wallet.total_user_funds ?? 0));
    return [
      {
        label: 'Total User Funds',
        value: this.money(wallet.total_user_funds),
        percent: 100,
        color: '#5B8DEF',
      },
      {
        label: 'Operator Funds',
        value: this.money(wallet.operator_funds),
        percent: Math.min(
          100,
          (Math.abs(wallet.operator_funds ?? 0) / total) * 100,
        ),
        color: '#FF3B47',
      },
      {
        label: 'Locked / In-play',
        value: this.money(wallet.locked_total),
        percent: Math.min(100, ((wallet.locked_total ?? 0) / total) * 100),
        color: '#FFB627',
      },
      {
        label: 'Withdrawable',
        value: this.money(wallet.withdrawable),
        percent: Math.min(100, ((wallet.withdrawable ?? 0) / total) * 100),
        color: '#2BD4A1',
      },
      {
        label: 'Dormant Funds',
        value: this.money(wallet.dormant_funds),
        percent: Math.min(100, ((wallet.dormant_funds ?? 0) / total) * 100),
        color: '#7A839E',
      },
    ];
  }

  get approvals() {
    const queue = this.homeData?.approval_queue ?? {};
    return [
      {
        icon: '£',
        label: 'Withdrawals',
        count: queue.withdrawals ?? 0,
        priority: `${queue.withdrawals_held ?? 0} held`,
      },
      {
        icon: '✓',
        label: 'Contest Reviews',
        count: queue.contest_reviews ?? 0,
        priority: '',
      },
      {
        icon: '!',
        label: 'RG Escalations',
        count: queue.rg_escalations ?? 0,
        priority: '',
      },
      {
        icon: '×',
        label: 'Account Deletion',
        count: queue.account_deletion ?? 0,
        priority: '',
      },
      {
        icon: '◉',
        label: 'Compliance',
        count: queue.compliance ?? 0,
        priority: '',
      },
    ];
  }

  get liveSummary(): string {
    const live = this.homeData?.live_ops ?? {};
    return `${live.live ?? 0} live · ${live.upcoming ?? 0} upcoming · prize pool ${this.money(live.prize_pool)}`;
  }

  get netRevenue(): string {
    return this.money(this.homeData?.finance?.net_operator_revenue);
  }
  get costsSummary(): string {
    const f = this.homeData?.finance ?? {};
    return `after ${this.money(f.stripe_fees)} Stripe · ${this.money(f.sumsub_costs)} Sumsub · ${this.money(f.bonus_expense)} bonus`;
  }

  private createSeries(
    color: string,
    values: number[],
    fill: boolean,
    scale = Math.max(1, ...values),
  ) {
    const max = Math.max(1, scale);
    const points = values.map((value, index) => {
      const x =
        values.length === 1 ? 38 : 38 + (index / (values.length - 1)) * 632;
      const y = 153 - (value / max) * 128;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const path = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'}${point}`)
      .join(' ');
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
