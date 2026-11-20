import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';
import { ADMIN_ROLES } from '../core/models/auth.models';
import { ComplianceComponent } from './compliance/compliance.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuditComponent } from './audit/audit.component';
import { BonusesComponent } from './bonuses/bonuses.component';
import { FootballOperationsComponent } from './football/football-operations.component';
import { ReportsComponent } from './reports/reports.component';
import { SubscriptionAnalyticsComponent } from './subscriptions/subscription-analytics.component';
import { SupportTicketsComponent } from './support/support-tickets.component';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { ProfileComponent } from './profile/profile.component';
import { RgMonitorComponent } from './responsible-gaming/rg-monitor.component';
import { RgRecordsComponent } from './responsible-gaming/rg-records.component';
import { UserProfileComponent } from './users/user-profile.component';
import { UserRecordsComponent } from './users/user-records.component';
import { WalletComponent } from './wallet/wallet.component';
import { WithdrawalReviewComponent } from './wallet/withdrawal-review.component';
const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivateChild: [AuthGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { roles: ADMIN_ROLES },
      },
      {
        path: 'profile',
        component: ProfileComponent,
        data: { roles: ADMIN_ROLES, title: 'My profile', breadcrumbs: ['Administration', 'My profile'] },
      },
      {
        path: 'compliance',
        data: { roles: ADMIN_ROLES },
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'cases' },
          {
            path: 'cases',
            component: ComplianceComponent,
            data: { title: 'Compliance Cases', breadcrumbs: ['Compliance', 'Cases'], view: 'cases' },
          },
          {
            path: 'kyc0',
            component: ComplianceComponent,
            data: { title: 'KYC0 Verification', breadcrumbs: ['Compliance', 'KYC0 Verification'], view: 'kyc0' },
          },
          {
            path: 'kyc1',
            component: ComplianceComponent,
            data: { title: 'KYC1 Verification', breadcrumbs: ['Compliance', 'KYC1 Verification'], view: 'kyc1' },
          },
          {
            path: 'aml',
            component: ComplianceComponent,
            data: { title: 'AML Monitoring', breadcrumbs: ['Compliance', 'AML Monitoring'], view: 'aml' },
          },
          {
            path: 'sof',
            component: ComplianceComponent,
            data: { title: 'Source of Funds (SoF)', breadcrumbs: ['Compliance', 'Source of Funds'], view: 'sof' },
          },
          {
            path: 'pep',
            component: ComplianceComponent,
            data: { title: 'PEP & Sanctions', breadcrumbs: ['Compliance', 'PEP & Sanctions'], view: 'pep' },
          },
          {
            path: 'suspicious',
            component: ComplianceComponent,
            data: { title: 'Suspicious Activities', breadcrumbs: ['Compliance', 'Suspicious Activities'], view: 'suspicious' },
          },
        ],
      },
      {
        path: 'responsible-gaming',
        data: { roles: ADMIN_ROLES },
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'high-risk' },
          {
            path: 'high-risk',
            component: RgMonitorComponent,
            data: { title: 'Responsible Gaming Monitor', breadcrumbs: ['Responsible Gaming', 'High-Risk Users'] },
          },
          {
            path: 'deposit-limits',
            component: RgRecordsComponent,
            data: { title: 'Deposit Limits', breadcrumbs: ['Responsible Gaming', 'Deposit Limits'], view: 'deposit-limits' },
          },
          {
            path: 'limit-reductions',
            component: RgRecordsComponent,
            data: { title: 'Limit Reduction Monitoring', breadcrumbs: ['Responsible Gaming', 'Limit Reduction Monitoring'], view: 'limit-reductions' },
          },
          {
            path: 'monthly-loss',
            component: RgRecordsComponent,
            data: { title: 'Monthly Loss Users', breadcrumbs: ['Responsible Gaming', 'Monthly Loss Users'], view: 'monthly-loss' },
          },
          {
            path: 'self-exclusion',
            component: RgRecordsComponent,
            data: { title: 'Self Exclusion Users', breadcrumbs: ['Responsible Gaming', 'Self Exclusion'], view: 'self-exclusion' },
          },
          {
            path: 'alerts',
            component: RgRecordsComponent,
            data: { title: 'RG Alerts', breadcrumbs: ['Responsible Gaming', 'RG Alerts'], view: 'alerts' },
          },
        ],
      },
      {
        path: 'users',
        data: { roles: ADMIN_ROLES },
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'all' },
          {
            path: 'all',
            component: UserRecordsComponent,
            data: { title: 'All Users', breadcrumbs: ['Users', 'All Users'], view: 'all' },
          },
          {
            path: 'profile/:userId',
            component: UserProfileComponent,
            data: { title: 'User Profile', breadcrumbs: ['Users', 'User Profile'] },
          },
          {
            path: 'profile',
            component: UserProfileComponent,
            data: { title: 'User Profile · #UK-48291', breadcrumbs: ['Users', 'All Users', 'Daniel Foster'] },
          },
          {
            path: 'students',
            component: UserRecordsComponent,
            data: { title: 'Student Users', breadcrumbs: ['Users', 'Student Users'], view: 'students' },
          },
          {
            path: 'subscriptions',
            component: UserRecordsComponent,
            data: { title: 'Subscription Users', breadcrumbs: ['Users', 'Subscription Users'], view: 'subscriptions' },
          },
          {
            path: 'consents',
            component: UserRecordsComponent,
            data: { title: 'Consent Logs', breadcrumbs: ['Users', 'Consent Logs'], view: 'consents' },
          },
          {
            path: 'deleted',
            component: UserRecordsComponent,
            data: { title: 'Deleted Accounts', breadcrumbs: ['Users', 'Deleted Accounts'], view: 'deleted' },
          },
        ],
      },
      {
        path: 'wallet',
        data: { roles: ADMIN_ROLES },
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'operator' },
          {
            path: 'operator',
            component: WalletComponent,
            data: { title: 'Operator Wallet & Funds', breadcrumbs: ['Wallet & Funds', 'Operator Funds'], view: 'operator' },
          },
          {
            path: 'withdrawal-review',
            component: WithdrawalReviewComponent,
            data: { title: 'Withdrawal Review Queue', breadcrumbs: ['Review & Approval', 'Withdrawal Reviews'] },
          },
          {
            path: 'deposits',
            component: WalletComponent,
            data: { title: 'Deposits', breadcrumbs: ['Finance & Wallet', 'Deposits'], view: 'deposits' },
          },
          {
            path: 'transactions',
            component: WalletComponent,
            data: { title: 'Transactions', breadcrumbs: ['Finance & Wallet', 'Transactions'], view: 'transactions' },
          },
          {
            path: 'user-funds',
            component: WalletComponent,
            data: { title: 'User Funds', breadcrumbs: ['Finance & Wallet', 'User Funds'], view: 'user-funds' },
          },
          {
            path: 'inactive-funds',
            component: WalletComponent,
            data: { title: 'Inactive Funds', breadcrumbs: ['Finance & Wallet', 'Inactive Funds'], view: 'inactive-funds' },
          },
        ],
      },
      {
        path: 'bonuses',
        data: { roles: ADMIN_ROLES },
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'overview' },
          {
            path: 'overview',
            component: BonusesComponent,
            data: {
              title: 'Bonuses & Rewards',
              breadcrumbs: ['Bonuses & Rewards', 'Overview'],
              actions: [{ label: 'Bonus Rules' }, { label: '+ New Campaign', primary: true }],
            },
          },
        ],
      },
      {
        path: 'subscriptions',
        data: { roles: ADMIN_ROLES },
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'analytics' },
          {
            path: 'analytics',
            component: SubscriptionAnalyticsComponent,
            data: {
              title: 'Subscription Analytics',
              breadcrumbs: ['Subscriptions', 'Dashboard'],
              actions: [
                { label: 'Range: This Quarter' },
                { label: 'Cohort Export' },
                { label: 'New Plan', primary: true },
              ],
            },
          },
        ],
      },
      {
        path: 'football',
        data: { roles: ADMIN_ROLES },
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'series' },
          {
            path: 'series',
            component: FootballOperationsComponent,
            data: {
              view: 'series',
              title: 'Series Manager',
              breadcrumbs: ['Football Operations', 'Series', 'View All'],
              actions: [
                { label: 'Filter' },
                { label: '+ Add Series', primary: true, route: '/admin/football/series/add' },
              ],
            },
          },
          {
            path: 'series/add',
            component: FootballOperationsComponent,
            data: {
              view: 'series-add',
              title: 'Add New Series',
              breadcrumbs: ['Football Operations', 'Series', 'Add New'],
              actions: [
                { label: 'Cancel', route: '/admin/football/series' },
                { label: 'Save Draft' },
                { label: 'Publish Series', primary: true },
              ],
            },
          },
          {
            path: 'matches',
            component: FootballOperationsComponent,
            data: {
              view: 'matches',
              title: 'Match Manager',
              breadcrumbs: ['Football Operations', 'Matches', 'View All'],
              actions: [
                { label: 'Filter' },
                { label: '+ Add Match', primary: true, route: '/admin/football/matches/add' },
              ],
            },
          },
          {
            path: 'matches/add',
            component: FootballOperationsComponent,
            data: {
              view: 'match-add',
              title: 'Add New Match',
              breadcrumbs: ['Football Operations', 'Matches', 'Add New'],
              actions: [
                { label: 'Cancel', route: '/admin/football/matches' },
                { label: 'Save Draft' },
                { label: 'Schedule Match', primary: true },
              ],
            },
          },
          {
            path: 'contests',
            component: FootballOperationsComponent,
            data: {
              view: 'contest',
              title: 'Contest Manager · Arsenal vs Liverpool',
              breadcrumbs: ['Football Operations', 'Match Manager', 'Arsenal vs Liverpool'],
              actions: [
                { label: 'Match Settings' },
                { label: 'Save Draft' },
                { label: 'Publish 3 Contests', primary: true },
              ],
            },
          },
          {
            path: 'contests/:matchId',
            component: FootballOperationsComponent,
            data: {
              view: 'contest',
              title: 'Match Contests',
              breadcrumbs: ['Football Operations', 'Match Manager', 'Match Contests'],
            },
          },
          {
            path: 'contests/add',
            component: FootballOperationsComponent,
            data: {
              view: 'contest-add',
              title: 'Add New Contest',
              breadcrumbs: ['Football Operations', 'Contests', 'Add New'],
              actions: [
                { label: 'Cancel', route: '/admin/football/contests' },
                { label: 'Save Draft' },
                { label: 'Publish Contest', primary: true },
              ],
            },
          },
        ],
      },
      {
        path: 'reports',
        data: { roles: ADMIN_ROLES },
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'library' },
          {
            path: 'library',
            component: ReportsComponent,
            data: {
              title: 'Reports & Analytics Library',
              breadcrumbs: ['Reports & Analytics', 'Library'],
              actions: [{ label: 'Schedule' }, { label: 'Generate Report', primary: true }],
            },
          },
        ],
      },
      {
        path: 'support',
        data: { roles: ADMIN_ROLES },
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'tickets' },
          {
            path: 'tickets',
            component: SupportTicketsComponent,
            data: {
              title: 'Support · Tickets, Complaints, Disputes',
              breadcrumbs: ['Support', 'Tickets'],
              actions: [{ label: 'Macros' }, { label: '+ Ticket', primary: true }],
            },
          },
        ],
      },
      {
        path: 'audit',
        data: { roles: ADMIN_ROLES },
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'logs' },
          {
            path: 'logs',
            component: AuditComponent,
            data: {
              title: 'Audit & Security',
              breadcrumbs: ['Audit & Security', 'Logs'],
              actions: [{ label: 'Range: 24h' }, { label: 'Export Audit Trail', primary: true }],
            },
          },
        ],
      },
    ],
  },
];
@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class AdminRoutingModule {}
