import { Component, Input } from '@angular/core';

export interface OpsMetric {
  label: string;
  value: string;
  detail: string;
  color: string;
  spark?: number[];
  change?: string;
  direction?: 'up' | 'down';
}

@Component({
  selector: 'app-ops-metric-card',
  templateUrl: './ops-metric-card.component.html',
  styleUrls: ['./ops-metric-card.component.css'],
})
export class OpsMetricCardComponent {
  @Input() metric!: OpsMetric;

  get points(): string {
    const values = this.metric.spark ?? [];
    if (values.length < 2) return '';
    const min = Math.min(...values);
    const range = Math.max(...values) - min || 1;
    return values.map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 27 - ((value - min) / range) * 22;
      return `${x},${y}`;
    }).join(' ');
  }
}
