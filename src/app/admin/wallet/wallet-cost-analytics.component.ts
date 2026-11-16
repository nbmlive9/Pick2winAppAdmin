import { Component } from '@angular/core';

@Component({
  selector: 'app-wallet-cost-analytics',
  templateUrl: './wallet-cost-analytics.component.html',
  styleUrls: ['./wallet-cost-analytics.component.css'],
})
export class WalletCostAnalyticsComponent {
  readonly providers = [
    { name: 'Stripe', color: '#5b8def', total: '£18,240', spark: '0,18 18,16 36,19 54,14 72,12 90,16 108,10 126,8 144,11 162,6 180,5 198,8 216,2 240,0', details: [['Deposit fees', '£12.8K'], ['Withdrawal fees', '£3.2K'], ['Failed', '£1.4K']] },
    { name: 'Sumsub', color: '#a78bfa', total: '£4,612', spark: '0,17 18,14 36,18 54,11 72,14 90,10 108,14 126,7 144,10 162,6 180,9 198,5 216,8 240,2', details: [['KYC0', '£1.2K'], ['KYC1', '£2.8K'], ['Reverify', '£420']] },
  ];
}
