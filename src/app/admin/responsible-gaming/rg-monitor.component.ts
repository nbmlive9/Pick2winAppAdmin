import { Component } from '@angular/core';
import { RgMetric, rgMetric } from './rg.models';

interface WatchRow {
  name: string;
  id: string;
  tier: string;
  usage: string;
  usagePercent: number;
  streak: string;
  loss: string;
  triggers: string[];
  risk: number;
  action: string;
  filters: string[];
}

interface AlertItem {
  severity: 'high' | 'medium' | 'low';
  time: string;
  message: string;
}

@Component({
  selector: 'app-rg-monitor',
  templateUrl: './rg-monitor.component.html',
  styleUrls: ['./rg-monitor.component.css'],
})
export class RgMonitorComponent {
  readonly primaryAction = 'RG Policy v1.4';
  readonly secondaryAction = 'Run Monthly Audit';
  readonly metrics: RgMetric[] = [
    rgMetric('Users at Limit', '312', '76% Other · 24% Student', '#5b8def', [180, 184, 192, 202, 210, 224, 236, 248, 256, 268, 278, 288, 298, 312], '2.4%'),
    rgMetric('Monthly Loss Users', '184', '42 consecutive 2 mo', '#ffb627', [120, 124, 128, 132, 140, 148, 156, 162, 168, 172, 176, 180, 182, 184], '6.1%'),
    rgMetric('High-Risk Users', '27', '11 escalated to compliance', '#ff3b47', [12, 14, 13, 16, 18, 15, 18, 20, 22, 21, 24, 23, 26, 27], '14%'),
    rgMetric('Self Excluded', '48', '22 active · 26 expired', '#a78bfa', [42, 44, 43, 45, 46, 46, 47, 47, 48, 48, 47, 48, 48, 48], '0.8%', 'down'),
  ];

  readonly lossSteps = [
    { count: '428', label: 'No action', number: '1', color: '#5b8def' },
    { count: '142', label: 'RG reminder', number: '2', color: '#a78bfa' },
    { count: '32', label: 'Suggest lower limit', number: '3', color: '#ffb627' },
    { count: '9', label: 'Compliance review', number: '4', color: '#ff6478' },
    { count: '2', label: 'Mandatory exclusion', number: '5+', color: '#ff3b47' },
  ];

  readonly limitTiers = [
    { label: 'Student Users', note: 'Default · capped · 12,420', amount: '£500', usage: 64, color: '#a78bfa' },
    { label: 'Other Users', note: 'Default · standard · 35,786', amount: '£1,500', usage: 48, color: '#5b8def' },
  ];

  readonly watchFilters = [
    { label: 'All Risk', key: 'all' },
    { label: 'Loss', key: 'loss' },
    { label: 'At Limit', key: 'at-limit' },
    { label: 'Velocity', key: 'velocity' },
    { label: 'Self-Excl', key: 'self-excl' },
  ];

  readonly watchRows: WatchRow[] = [
    { name: 'Hannah Wells', id: 'UK-48211', tier: 'Student', usage: '£500 / £500', usagePercent: 100, streak: '5 mo', loss: '−£2,400', triggers: ['5 mo loss', 'at limit', '+1'], risk: 94, action: 'Suspend', filters: ['loss', 'at-limit'] },
    { name: 'Karl Vincent', id: 'UK-48109', tier: 'Other', usage: '£1,500 / £1,500', usagePercent: 100, streak: '4 mo', loss: '−£5,200', triggers: ['4 mo loss', 'at limit'], risk: 88, action: 'Review', filters: ['loss', 'at-limit'] },
    { name: 'Sophie Lin', id: 'UK-47998', tier: 'Student', usage: '£500 / £500', usagePercent: 100, streak: '3 mo', loss: '−£1,500', triggers: ['3 mo loss', 'velocity'], risk: 82, action: 'Review', filters: ['loss', 'at-limit', 'velocity'] },
    { name: 'Marcus Reed', id: 'UK-47821', tier: 'Other', usage: '£1,380 / £1,500', usagePercent: 92, streak: '4 mo', loss: '−£3,800', triggers: ['4 mo loss', 'limit reduce 1x'], risk: 79, action: 'Review', filters: ['loss'] },
    { name: 'Tara Goldsmith', id: 'UK-47720', tier: 'Student', usage: '£500 / £500', usagePercent: 100, streak: '2 mo', loss: '−£1,000', triggers: ['2 mo loss', 'at limit'], risk: 72, action: 'Review', filters: ['loss', 'at-limit'] },
    { name: 'Jonas Reid', id: 'UK-48402', tier: 'Other', usage: '£1,240 / £1,500', usagePercent: 83, streak: '2 mo', loss: '−£1,200', triggers: ['2 mo loss', 'RG warning'], risk: 68, action: 'Review', filters: ['loss'] },
  ];

  readonly alerts: AlertItem[] = [
    { severity: 'high', time: '2m ago', message: 'Hannah Wells reached monthly limit — 5th consecutive loss month' },
    { severity: 'high', time: '14m ago', message: 'Karl Vincent attempted limit increase — auto-blocked, escalated' },
    { severity: 'medium', time: '38m ago', message: 'Sophie Lin late-night velocity 4× weekly avg' },
    { severity: 'medium', time: '1h ago', message: 'Marcus Reed used one-time limit reduction option' },
    { severity: 'low', time: '2h ago', message: 'Tara Goldsmith → 2 consecutive loss months · reminder sent' },
    { severity: 'low', time: '3h ago', message: '9 users acknowledged RG policy v1.4' },
  ];

  activeFilter = 'all';
  searchTerm = '';
  notice = '';

  get filteredWatchRows(): WatchRow[] {
    const query = this.searchTerm.trim().toLowerCase();
    return this.watchRows.filter(row => {
      const filterMatch = this.activeFilter === 'all' || row.filters.includes(this.activeFilter);
      const queryMatch = !query || `${row.name} ${row.id} ${row.tier} ${row.triggers.join(' ')}`
        .toLowerCase().includes(query);
      return filterMatch && queryMatch;
    });
  }

  setSearchTerm(value: string): void {
    this.searchTerm = value;
  }

  setFilter(key: string): void {
    this.activeFilter = key;
  }

  handleTopbarAction(action: 'primary' | 'secondary'): void {
    this.notice = `${action === 'primary' ? this.primaryAction : this.secondaryAction} selected.`;
  }

  handleRowAction(action: string, user: string): void {
    this.notice = `${action} selected for ${user}.`;
  }

  getRiskTone(score: number): string {
    return score >= 80 ? 'risk-high' : score >= 60 ? 'risk-medium' : 'risk-low';
  }

  getInitials(name: string): string {
    return name.split(' ').map(part => part[0]).join('').slice(0, 2);
  }
}