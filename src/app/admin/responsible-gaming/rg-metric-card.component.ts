import { Component, Input } from '@angular/core';
import { RgMetric } from './rg.models';

@Component({
  selector: 'app-rg-metric-card',
  templateUrl: './rg-metric-card.component.html',
  styleUrls: ['./rg-metric-card.component.css'],
})
export class RgMetricCardComponent {
  @Input({ required: true }) metric!: RgMetric;
}
