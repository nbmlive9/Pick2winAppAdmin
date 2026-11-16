import { Component, OnDestroy } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { ComplianceComponent } from '../compliance/compliance.component';
import { RgMonitorComponent } from '../responsible-gaming/rg-monitor.component';
import { RgRecordsComponent } from '../responsible-gaming/rg-records.component';
import { UserProfileComponent } from '../users/user-profile.component';
import { UserRecordsComponent } from '../users/user-records.component';
import { WalletComponent } from '../wallet/wallet.component';
import { WithdrawalReviewComponent } from '../wallet/withdrawal-review.component';

interface LayoutAction {
  label: string;
  primary?: boolean;
  route?: string;
}

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
})
export class AdminLayoutComponent implements OnDestroy {
  private readonly session: Subscription;
  private readonly navigation: Subscription;
  pageTitle = 'Admin Workspace';
  breadcrumbs: string[] = ['Pick2Win Ops', 'Administration'];
  routeActions: LayoutAction[] = [];
  activeRecordsPage: UserRecordsComponent | null = null;
  activeUserProfile: UserProfileComponent | null = null;
  activeRgRecordsPage: RgRecordsComponent | null = null;
  activeRgMonitorPage: RgMonitorComponent | null = null;
  activeCompliancePage: ComplianceComponent | null = null;
  activeWalletPage: WalletComponent | null = null;
  activeWithdrawalPage: WithdrawalReviewComponent | null = null;
  globalSearch = '';
  usersExpanded = false;
  rgExpanded = false;
  complianceExpanded = false;
  walletExpanded = false;
  footballExpanded = false;

  constructor(
    public auth: AuthService,
    private router: Router,
  ) {
    this.session = auth.user$.subscribe((user) => {
      if (!user)
        void this.router.navigate(['/login'], {
          queryParams: { reason: 'expired' },
        });
    });
    this.updatePageContext();
    this.navigation = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    ).subscribe(() => {
      this.updatePageContext();
    });
  }

  private updatePageContext(): void {
    let activeRoute: ActivatedRouteSnapshot = this.router.routerState.snapshot.root;
    while (activeRoute.firstChild) {
      activeRoute = activeRoute.firstChild;
    }

    const data = activeRoute.data;
    this.pageTitle = data['title'] || 'Admin Workspace';
    this.routeActions = Array.isArray(data['actions']) ? data['actions'] : [];
    const breadcrumbs = data['breadcrumbs'];
    this.breadcrumbs = Array.isArray(breadcrumbs)
      ? breadcrumbs
      : ['Pick2Win Ops', 'Administration'];
  }

  onChildActivate(component: unknown): void {
    this.activeRecordsPage = component instanceof UserRecordsComponent ? component : null;
    this.activeUserProfile = component instanceof UserProfileComponent ? component : null;
    this.activeRgRecordsPage = component instanceof RgRecordsComponent ? component : null;
    this.activeRgMonitorPage = component instanceof RgMonitorComponent ? component : null;
    this.activeCompliancePage = component instanceof ComplianceComponent ? component : null;
    this.activeWalletPage = component instanceof WalletComponent ? component : null;
    this.activeWithdrawalPage = component instanceof WithdrawalReviewComponent ? component : null;
    this.activeRecordsPage?.setSearchTerm(this.globalSearch);
    this.activeRgRecordsPage?.setSearchTerm(this.globalSearch);
    this.activeRgMonitorPage?.setSearchTerm(this.globalSearch);
    this.activeCompliancePage?.setSearchTerm(this.globalSearch);
    this.activeWalletPage?.setSearchTerm(this.globalSearch);
    this.activeWithdrawalPage?.setSearchTerm(this.globalSearch);
  }

  updateGlobalSearch(event: Event): void {
    this.globalSearch = (event.target as HTMLInputElement).value;
    this.activeRecordsPage?.setSearchTerm(this.globalSearch);
    this.activeRgRecordsPage?.setSearchTerm(this.globalSearch);
    this.activeRgMonitorPage?.setSearchTerm(this.globalSearch);
    this.activeCompliancePage?.setSearchTerm(this.globalSearch);
    this.activeWalletPage?.setSearchTerm(this.globalSearch);
    this.activeWithdrawalPage?.setSearchTerm(this.globalSearch);
  }

  get isRgRoute(): boolean {
    return this.router.url.startsWith('/admin/responsible-gaming');
  }

  get isComplianceRoute(): boolean {
    return this.router.url.startsWith('/admin/compliance');
  }

  get isWalletRoute(): boolean {
    return this.router.url.startsWith('/admin/wallet');
  }

  get isFootballRoute(): boolean {
    return this.router.url.startsWith('/admin/football');
  }

  ngOnDestroy(): void {
    this.session.unsubscribe();
    this.navigation.unsubscribe();
  }
}
