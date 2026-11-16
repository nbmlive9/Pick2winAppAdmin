export type ComplianceTone = 'red' | 'green' | 'amber' | 'blue' | 'violet' | 'muted';

export interface ComplianceMetric {
  label: string;
  value: string;
  detail?: string;
  change?: string;
  color: string;
  points: string;
}

export interface ComplianceCell {
  text: string;
  kind?: 'person' | 'score' | 'badge' | 'action' | 'mono';
  tone?: ComplianceTone;
  score?: number;
  color?: string;
  id?: string;
  initials?: string;
  restricted?: boolean;
}

export interface ComplianceRow {
  cells: ComplianceCell[];
  filters: string[];
  highlight?: boolean;
}

export interface ComplianceFilter {
  label: string;
  key: string;
}

export interface CompliancePage {
  title: string;
  crumbs: string[];
  primaryAction: string;
  secondaryAction: string;
  subtitle: string;
  metrics: ComplianceMetric[];
  tableTitle: string;
  tableDescription: string;
  filters: ComplianceFilter[];
  columns: string[];
  rows: ComplianceRow[];
}
