import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from 'src/app/core/services/admin.service';

interface TimelineEvent {
  timestamp: number;
  time: string;
  title: string;
  description: string;
  kind: 'wallet' | 'contest' | 'compliance' | 'consent';
}

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  userId = '';
  data: any = null;
  loading = false;
  notice = '';
  timelineFilter = 'all';
  private loadSequence = 0;

  constructor(
    private route: ActivatedRoute,
    private admin: AdminService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const userId = params.get('userId') || this.route.snapshot.queryParamMap.get('userId');
      if (!userId) {
        this.notice = 'Select a user from the user list to load their profile.';
        return;
      }
      this.userId = userId;
      this.loadProfile();
    });
  }

  loadProfile(): void {
    if (!this.userId) return;
    this.loading = true;
    this.notice = '';
    this.timelineFilter = 'all';
    const requestSequence = ++this.loadSequence;
    this.admin.getUserProfile(this.userId).subscribe({
      next: (response: any) => {
        if (requestSequence !== this.loadSequence) return;
        this.loading = false;
        if (!response?.data?.profile) {
          this.data = null;
          this.notice = 'The user profile response was not in the expected format.';
          return;
        }
        this.data = response.data;
      },
      error: (error: HttpErrorResponse) => {
        if (requestSequence !== this.loadSequence) return;
        this.loading = false;
        this.data = null;
        const detail =
          typeof error.error?.message === 'string'
            ? error.error.message
            : error.status === 0
              ? 'The API could not be reached (network or CORS error).'
              : `HTTP ${error.status}${error.statusText ? ` ${error.statusText}` : ''}.`;
        this.notice = `Could not load user profile: ${detail}`;
      },
    });
  }

  get profile(): any {
    return this.data?.profile ?? {};
  }

  get filteredTimeline(): TimelineEvent[] {
    const events: TimelineEvent[] = [];
    const addEvent = (
      value: string | null | undefined,
      title: string,
      description: string,
      kind: TimelineEvent['kind'],
    ) => {
      if (!value) return;
      const timestamp = new Date(value).getTime();
      if (Number.isNaN(timestamp)) return;
      events.push({
        timestamp,
        time: this.formatDateTime(value),
        title,
        description,
        kind,
      });
    };

    addEvent(
      this.profile.created_at,
      'Account registered',
      `User ID ${this.profile.userid ?? this.profile.id ?? this.userId}`,
      'compliance',
    );
    addEvent(
      this.data?.financial_summary?.last_deposit_at,
      'Deposit activity recorded',
      `${this.money(this.data?.financial_summary?.total_deposited)} total across ${this.number(this.data?.financial_summary?.deposit_count)} deposits`,
      'wallet',
    );
    addEvent(
      this.data?.contests?.last_joined_at,
      'Contest activity recorded',
      `${this.number(this.data?.contests?.total_entries)} total contest entries`,
      'contest',
    );
    addEvent(
      this.data?.activity?.last_activity_at,
      'Last recorded activity',
      `${this.number(this.data?.activity?.total_activities)} activities recorded`,
      'compliance',
    );
    addEvent(
      this.profile.current_login,
      'User signed in',
      `IP ${this.profile.current_login_ip ?? '—'}`,
      'compliance',
    );
    for (const consent of this.consents) {
      addEvent(
        consent.accepted_at,
        `Consent accepted: ${consent.policy ?? 'Policy'}`,
        `Version ${consent.version ?? '—'} · IP ${consent.ip_address ?? '—'}`,
        'consent',
      );
    }

    return events
      .filter(
        (event) =>
          this.timelineFilter === 'all' || event.kind === this.timelineFilter,
      )
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  get devices(): any[] {
    return Array.isArray(this.data?.devices) ? this.data.devices : [];
  }

  get consents(): any[] {
    return Array.isArray(this.data?.consents) ? this.data.consents : [];
  }

  get complianceCases(): any[] {
    return Array.isArray(this.data?.compliance_cases)
      ? this.data.compliance_cases
      : [];
  }

  get adminNotes(): any[] {
    return Array.isArray(this.data?.admin_notes) ? this.data.admin_notes : [];
  }

  money(value: unknown): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  }

  number(value: unknown): string {
    return new Intl.NumberFormat('en-GB').format(Number(value) || 0);
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return '—';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? '—'
      : parsed.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
  }

  formatDateTime(value: string | null | undefined): string {
    if (!value) return '—';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? '—'
      : parsed.toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
  }

  percent(value: unknown, total: unknown): number {
    const denominator = Number(total) || 0;
    return denominator > 0
      ? Math.max(0, Math.min(100, ((Number(value) || 0) / denominator) * 100))
      : 0;
  }

  isEnabled(value: unknown): boolean {
    return value === true || Number(value) === 1;
  }

  setTimelineFilter(event: Event): void {
    this.timelineFilter = (event.target as HTMLSelectElement).value;
  }

  showAction(action: string): void {
    this.notice = `${action} requires the connected account-management service.`;
  }
}
