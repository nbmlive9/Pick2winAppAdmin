import { Component, Input } from '@angular/core';
import { WalletMetric } from './wallet.component';

@Component({
  selector: 'app-wallet-metric-card',
  templateUrl: './wallet-metric-card.component.html',
  styleUrls: ['./wallet-metric-card.component.css'],
})
export class WalletMetricCardComponent {
  @Input() metric!: WalletMetric;

  get points(): string {
    return this.metric.spark.map((value, index) => {
      const x = (index / (this.metric.spark.length - 1)) * 100;
      const y = 30 - (value / 100) * 28;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }
}
