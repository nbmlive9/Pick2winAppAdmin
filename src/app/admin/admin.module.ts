import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';
import { ComplianceComponent } from './compliance/compliance.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { AuditComponent } from './audit/audit.component';
import { BonusesComponent } from './bonuses/bonuses.component';
import { FootballContestManagerComponent } from './football/football-contest-manager.component';
import { FootballOperationsComponent } from './football/football-operations.component';
import { OpsMetricCardComponent } from './shared/ops-metric-card.component';
import { ReportsComponent } from './reports/reports.component';
import { SubscriptionAnalyticsComponent } from './subscriptions/subscription-analytics.component';
import { SupportTicketsComponent } from './support/support-tickets.component';
import { ProfileComponent } from './profile/profile.component';
import { RgMetricCardComponent } from './responsible-gaming/rg-metric-card.component';
import { RgMonitorComponent } from './responsible-gaming/rg-monitor.component';
import { RgRecordsComponent } from './responsible-gaming/rg-records.component';
import { UserProfileComponent } from './users/user-profile.component';
import { UserRecordsComponent } from './users/user-records.component';
import { WalletCostAnalyticsComponent } from './wallet/wallet-cost-analytics.component';
import { WalletMetricCardComponent } from './wallet/wallet-metric-card.component';
import { WalletComponent } from './wallet/wallet.component';
import { WithdrawalReviewComponent } from './wallet/withdrawal-review.component';

@NgModule({
  declarations: [
    AdminLayoutComponent,
    ComplianceComponent,
    DashboardComponent,
    ProfileComponent,
    UserProfileComponent,
    UserRecordsComponent,
    RgMetricCardComponent,
    RgMonitorComponent,
    RgRecordsComponent,
    WalletComponent,
    WalletCostAnalyticsComponent,
    WalletMetricCardComponent,
    WithdrawalReviewComponent,
    AuditComponent,
    BonusesComponent,
    FootballContestManagerComponent,
    FootballOperationsComponent,
    OpsMetricCardComponent,
    ReportsComponent,
    SubscriptionAnalyticsComponent,
    SupportTicketsComponent,
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AdminRoutingModule],
})
export class AdminModule {}
