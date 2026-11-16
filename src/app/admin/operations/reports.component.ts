import { Component } from '@angular/core';

interface ReportItem {
  name: string;
  detail: string;
  lastRun: string;
}

interface ReportCategory {
  name: string;
  icon: string;
  color: string;
  reports: ReportItem[];
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class ReportsComponent {
  readonly categories: ReportCategory[] = [
    { name: 'Financial', icon: '£', color: '#5b8def', reports: [
      { name: 'Daily Revenue Reconciliation', detail: 'CSV · scheduled · 06:00 UTC', lastRun: '2h ago' },
      { name: 'Stripe Fee Breakdown', detail: 'PDF · monthly', lastRun: 'May 1' },
      { name: 'Sumsub Cost Report', detail: 'XLSX · monthly', lastRun: 'May 1' },
      { name: 'Net Operator Revenue', detail: 'PDF · monthly', lastRun: 'May 1' },
    ] },
    { name: 'User & Behavior', icon: '◎', color: '#a78bfa', reports: [
      { name: 'New User Cohort Analysis', detail: 'XLSX · weekly', lastRun: '2d ago' },
      { name: 'DAU/WAU/MAU Trend', detail: 'PDF · weekly', lastRun: '2d ago' },
      { name: 'Winning vs Losing Users', detail: 'CSV · monthly', lastRun: 'May 1' },
      { name: 'Deleted Account Audit', detail: 'PDF · monthly', lastRun: 'May 1' },
    ] },
    { name: 'Compliance', icon: '✓', color: '#2bd4a1', reports: [
      { name: 'KYC Funnel & SLA', detail: 'PDF · weekly', lastRun: '2d ago' },
      { name: 'AML Alert Summary', detail: 'CSV · daily', lastRun: '5h ago' },
      { name: 'SoF Cases & Outcomes', detail: 'PDF · monthly', lastRun: 'May 1' },
      { name: 'PEP Sanctions Scan', detail: 'CSV · weekly', lastRun: '2d ago' },
      { name: 'SAR Filings Register', detail: 'PDF · quarterly', lastRun: 'Apr 1' },
    ] },
    { name: 'Responsible Gaming', icon: '◐', color: '#ff3b47', reports: [
      { name: 'Loss Months Population', detail: 'XLSX · monthly', lastRun: 'May 1' },
      { name: 'Limit Reductions Log', detail: 'CSV · monthly', lastRun: 'May 1' },
      { name: 'Self-Exclusion Register', detail: 'PDF · weekly', lastRun: '2d ago' },
      { name: 'High-Risk Escalations', detail: 'CSV · weekly', lastRun: '2d ago' },
    ] },
    { name: 'Bonuses & Subs', icon: '★', color: '#ffb627', reports: [
      { name: 'Bonus Distribution & Usage', detail: 'XLSX · weekly', lastRun: '2d ago' },
      { name: 'Referral Effectiveness', detail: 'PDF · monthly', lastRun: 'May 1' },
      { name: 'Subscription Renewals', detail: 'CSV · weekly', lastRun: '2d ago' },
      { name: 'Cohort LTV', detail: 'PDF · monthly', lastRun: 'May 1' },
    ] },
    { name: 'Expenses', icon: '$', color: '#ff6478', reports: [
      { name: 'Operator P&L', detail: 'PDF · monthly', lastRun: 'May 1' },
      { name: 'Variable Cost Breakdown', detail: 'XLSX · monthly', lastRun: 'May 1' },
      { name: 'Marketing Spend ROI', detail: 'PDF · quarterly', lastRun: 'Apr 1' },
    ] },
  ];
}
