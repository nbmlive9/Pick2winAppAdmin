import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-wallet-cost-analytics',
  templateUrl: './wallet-cost-analytics.component.html',
  styleUrls: ['./wallet-cost-analytics.component.css'],
})
export class WalletCostAnalyticsComponent {
  @Input() costs: { category: string; amount: string }[] = [];
  @Input() rangeLabel = '';
}
