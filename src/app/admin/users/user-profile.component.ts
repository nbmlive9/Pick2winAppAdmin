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
  userNotes: any[] = [];
  notesLoading = false;
  notesNotice = '';
  showAddNoteForm = false;
  newAdminNote = '';
  noteSubmitting = false;
  noteSubmitSuccess = '';
  noteSubmitError = '';
  suspendSubmitting = false;
  suspendError = '';
  suspendSuccess = '';
  unsuspendSubmitting = false;
  unsuspendError = '';
  unsuspendSuccess = '';
  suspensionState: boolean | null = null;
  deleteSubmitting = false;
  deleteError = '';
  deleteSuccess = '';
  showErasureForm = false;
  erasureNote = 'GDPR erasure completed.';
  erasureSubmitting = false;
  erasureError = '';
  erasureSuccess = '';
  notesPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null = null;
  timelineFilter = 'all';
  private loadSequence = 0;
  private notesLoadSequence = 0;

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
      this.suspensionState = null;
      this.notesLoadSequence++;
      this.data = null;
      this.userNotes = [];
      this.notesLoading = false;
      this.notesNotice = '';
      this.showAddNoteForm = false;
      this.newAdminNote = '';
      this.noteSubmitSuccess = '';
      this.noteSubmitError = '';
      this.noteSubmitting = false;
      this.notesPagination = null;
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
        if (this.suspensionState === null) {
          const status = String(this.profile.account_status ?? '').toLowerCase();
          this.suspensionState =
            status === 'suspended' ||
            status === 'blocked' ||
            this.isEnabled(this.profile.is_blocked);
        }
        this.loadUserNotes(1);
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

  loadUserNotes(page = 1): void {
    if (!this.userId) return;
    this.notesLoading = true;
    this.notesNotice = '';
    const requestSequence = ++this.notesLoadSequence;
    this.admin.getUserNotes(this.userId, page, 20).subscribe({
      next: (response: any) => {
        if (requestSequence !== this.notesLoadSequence) return;
        this.notesLoading = false;
        if (!Array.isArray(response?.data)) {
          this.userNotes = [];
          this.notesPagination = null;
          this.notesNotice = 'The user notes response was not in the expected format.';
          return;
        }
        this.userNotes = response.data;
        const pagination = response.pagination ?? {};
        this.notesPagination = {
          total: Number(pagination.total) || 0,
          page: Number(pagination.page) || page,
          limit: Number(pagination.limit) || 20,
          totalPages: Math.max(0, Number(pagination.totalPages) || 0),
        };
      },
      error: (error: HttpErrorResponse) => {
        if (requestSequence !== this.notesLoadSequence) return;
        this.notesLoading = false;
        this.userNotes = [];
        this.notesPagination = null;
        this.notesNotice =
          typeof error.error?.message === 'string'
            ? error.error.message
            : error.status === 0
              ? 'The notes API could not be reached (network or CORS error).'
              : `Could not load user notes: HTTP ${error.status}${error.statusText ? ` ${error.statusText}` : ''}.`;
      },
    });
  }

  toggleAddNoteForm(): void {
    this.showAddNoteForm = !this.showAddNoteForm;
    this.noteSubmitSuccess = '';
    this.noteSubmitError = '';
  }

  submitAdminNote(event: Event): void {
    event.preventDefault();
    const note = this.newAdminNote.trim();
    if (!this.userId || !note || this.noteSubmitting) return;

    this.noteSubmitting = true;
    this.noteSubmitSuccess = '';
    this.noteSubmitError = '';
    this.admin.addUserNote(this.userId, note).subscribe({
      next: (response: any) => {
        this.noteSubmitting = false;
        if (response?.success === false) {
          this.noteSubmitError =
            response?.message || response?.error || 'The API did not accept the note.';
          return;
        }
        this.newAdminNote = '';
        this.showAddNoteForm = false;
        this.noteSubmitSuccess =
          response?.message || 'Admin note added successfully.';
        this.loadUserNotes(1);
      },
      error: (error: HttpErrorResponse) => {
        this.noteSubmitting = false;
        this.noteSubmitError =
          (typeof error.error?.message === 'string' && error.error.message) ||
          (typeof error.error?.error === 'string' && error.error.error) ||
          (error.status === 0
            ? 'Could not reach the add note API (network or CORS error).'
            : `Could not add admin note: HTTP ${error.status}${error.statusText ? ` ${error.statusText}` : ''}.`);
      },
    });
  }

  suspendUser(): void {
    if (!this.userId || this.suspendSubmitting) return;
    this.suspendSubmitting = true;
    this.suspendError = '';
    this.suspendSuccess = '';
    this.unsuspendError = '';
    this.unsuspendSuccess = '';
    this.admin.suspendUser(this.userId, 'Suspected multiple accounts').subscribe({
      next: (response: any) => {
        this.suspendSubmitting = false;
        if (response?.success === false) {
          this.suspendError = response?.message || response?.error || 'The API did not suspend this user.';
          return;
        }
        this.suspendSuccess = response?.message || 'User suspended successfully.';
        this.suspensionState = true;
        this.loadProfile();
      },
      error: (error: HttpErrorResponse) => {
        this.suspendSubmitting = false;
        this.suspendError =
          (typeof error.error?.message === 'string' && error.error.message) ||
          (typeof error.error?.error === 'string' && error.error.error) ||
          (error.status === 0
            ? 'Could not reach the suspend user API (network or CORS error).'
            : `Could not suspend user: HTTP ${error.status}${error.statusText ? ` ${error.statusText}` : ''}.`);
      },
    });
  }

  unsuspendUser(): void {
    if (!this.userId || this.unsuspendSubmitting) return;
    this.unsuspendSubmitting = true;
    this.unsuspendError = '';
    this.unsuspendSuccess = '';
    this.suspendError = '';
    this.suspendSuccess = '';
    this.admin.unsuspendUser(this.userId, 'Review cleared').subscribe({
      next: (response: any) => {
        this.unsuspendSubmitting = false;
        if (response?.success === false) {
          this.unsuspendError = response?.message || response?.error || 'The API did not unsuspend this user.';
          return;
        }
        this.unsuspendSuccess = response?.message || 'User unsuspended successfully.';
        this.suspensionState = false;
        this.loadProfile();
      },
      error: (error: HttpErrorResponse) => {
        this.unsuspendSubmitting = false;
        this.unsuspendError =
          (typeof error.error?.message === 'string' && error.error.message) ||
          (typeof error.error?.error === 'string' && error.error.error) ||
          (error.status === 0
            ? 'Could not reach the unsuspend user API (network or CORS error).'
            : `Could not unsuspend user: HTTP ${error.status}${error.statusText ? ` ${error.statusText}` : ''}.`);
      },
    });
  }

  deleteUser(): void {
    if (!this.userId || this.deleteSubmitting) return;
    const name = this.profile.name || this.userId;
    if (!window.confirm(`Delete the account for ${name}? This action may not be reversible.`)) return;

    this.deleteSubmitting = true;
    this.deleteError = '';
    this.deleteSuccess = '';
    this.suspendError = '';
    this.unsuspendError = '';
    this.suspendSuccess = '';
    this.unsuspendSuccess = '';
    this.admin.deleteUser(this.userId, 'Duplicate account').subscribe({
      next: (response: any) => {
        this.deleteSubmitting = false;
        if (response?.success === false) {
          this.deleteError = response?.message || response?.error || 'The API did not delete this user.';
          return;
        }
        this.deleteSuccess = response?.message || 'User account deleted successfully.';
      },
      error: (error: HttpErrorResponse) => {
        this.deleteSubmitting = false;
        this.deleteError =
          (typeof error.error?.message === 'string' && error.error.message) ||
          (typeof error.error?.error === 'string' && error.error.error) ||
          (error.status === 0
            ? 'Could not reach the delete user API (network or CORS error).'
            : `Could not delete user: HTTP ${error.status}${error.statusText ? ` ${error.statusText}` : ''}.`);
      },
    });
  }

  toggleErasureForm(): void {
    this.showErasureForm = !this.showErasureForm;
    this.erasureError = '';
  }

  submitAccountErasure(event: Event): void {
    event.preventDefault();
    const note = this.erasureNote.trim();
    if (!this.userId || !note || this.erasureSubmitting) return;
    if (!window.confirm(`Mark the account for ${this.profile.name || this.userId} as erased?`)) return;

    this.erasureSubmitting = true;
    this.erasureError = '';
    this.erasureSuccess = '';
    this.deleteError = '';
    this.deleteSuccess = '';
    this.suspendError = '';
    this.unsuspendError = '';
    this.suspendSuccess = '';
    this.unsuspendSuccess = '';
    this.admin.markAccountErased(this.userId, note).subscribe({
      next: (response: any) => {
        this.erasureSubmitting = false;
        if (response?.success === false) {
          this.erasureError = response?.message || response?.error || 'The API did not mark this account as erased.';
          return;
        }
        this.showErasureForm = false;
        this.erasureSuccess = response?.message || 'Account marked as erased successfully.';
      },
      error: (error: HttpErrorResponse) => {
        this.erasureSubmitting = false;
        this.erasureError =
          (typeof error.error?.message === 'string' && error.error.message) ||
          (typeof error.error?.error === 'string' && error.error.error) ||
          (error.status === 0
            ? 'Could not reach the account erasure API (network or CORS error).'
            : `Could not mark account as erased: HTTP ${error.status}${error.statusText ? ` ${error.statusText}` : ''}.`);
      },
    });
  }


  previousUserNotesPage(): void {
    if (this.notesPagination && this.notesPagination.page > 1)
      this.loadUserNotes(this.notesPagination.page - 1);
  }

  nextUserNotesPage(): void {
    if (
      this.notesPagination &&
      this.notesPagination.page < this.notesPagination.totalPages
    )
      this.loadUserNotes(this.notesPagination.page + 1);
  }

  noteText(note: any): string {
    return String(
      note?.note ?? note?.content ?? note?.message ?? note?.text ?? 'Note text unavailable',
    );
  }

  noteAuthor(note: any): string {
    return String(
      note?.admin_name ?? note?.created_by ?? note?.author ?? note?.admin ?? 'Admin',
    );
  }

  noteCreatedAt(note: any): string | null {
    return note?.created_at ?? note?.createdAt ?? note?.timestamp ?? null;
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
