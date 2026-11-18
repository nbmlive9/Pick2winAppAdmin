import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AdminRoutingModule } from './admin-routing.module';
import { ComplianceComponent } from './compliance/compliance.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { AuditComponent } from './operations/audit.component';
import { BonusesComponent } from './operations/bonuses.component';
import { FootballContestManagerComponent } from './operations/football-contest-manager.component';
import { FootballOperationsComponent } from './operations/football-operations.component';
import { OpsMetricCardComponent } from './operations/ops-metric-card.component';
import { ReportsComponent } from './operations/reports.component';
import { SubscriptionAnalyticsComponent } from './operations/subscription-analytics.component';
import { SupportTicketsComponent } from './operations/support-tickets.component';
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
  imports: [CommonModule, AdminRoutingModule],
})
export class AdminModule {}
