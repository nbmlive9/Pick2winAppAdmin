export type RgTone = 'red' | 'green' | 'amber' | 'blue' | 'violet' | 'muted';

export interface RgMetric {
  label: string;
  value: string;
  detail: string;
  color: string;
  sparkline: string;
  change?: string;
  direction?: 'up' | 'down';
}

export interface RgCell {
  value: string;
  tone?: RgTone;
  badge?: boolean;
  action?: boolean;
}

export interface RgRow {
  name: string;
  id: string;
  userId?: string | number;
  depositLimit?: number;
  limitRequestId?: string | number;
  selfExclusionId?: string | number;
  alertId?: string | number;
  gamstopStatus?: string;
  marketingBlocked?: boolean;
  cells: RgCell[];
  filters: string[];
  highlight?: boolean;
}

export interface RgFilter {
  label: string;
  key: string;
}

export interface RgRecordsPage {
  title: string;
  description: string;
  metrics: RgMetric[];
  columns: string[];
  filters: RgFilter[];
  rows: RgRow[];
  primaryAction: string;
  secondaryAction: string;
  activeTone?: RgTone;
}

export const rgSeries = (values: number[]): string => {
  const maximum = Math.max(...values);
  const minimum = Math.min(...values);
  const range = maximum - minimum || 1;
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 28 - ((value - minimum) / range) * 24;
      return `${x},${y.toFixed(1)}`;
    })
    .join(' ');
};

export const rgMetric = (
  label: string,
  value: string,
  detail: string,
  color: string,
  values: number[],
  change?: string,
  direction: 'up' | 'down' = 'up',
): RgMetric => ({
  label,
  value,
  detail,
  color,
  sparkline: rgSeries(values),
  change,
  direction,
});
