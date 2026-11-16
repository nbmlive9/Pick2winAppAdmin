import { Component } from '@angular/core';

interface TimelineEvent {
  time: string;
  title: string;
  description: string;
  kind: 'wallet' | 'contest' | 'compliance' | 'consent';
  flag?: 'pending' | 'verified';
}

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent {
  notice = '';
  timelineFilter = 'all';
  readonly timeline: TimelineEvent[] = [
    { time: 'Today · 11:00', title: 'Withdrawal Requested', description: '£200.00 → ending •••4218', kind: 'wallet', flag: 'pending' },
    { time: 'Today · 10:45', title: 'Won Contest', description: 'Arsenal vs Liverpool — Mega Contest · rank #18 · +£100.00', kind: 'contest' },
    { time: 'Today · 10:20', title: 'Joined Contest', description: 'Mega Contest — entry £25 · team “Foster XI”', kind: 'contest' },
    { time: 'Today · 10:15', title: 'Deposited Funds', description: '£50.00 via Stripe (Visa •••4218) · fee £0.78', kind: 'wallet' },
    { time: 'Today · 10:08', title: 'KYC1 Documents Uploaded', description: 'UK Passport + selfie · Sumsub ref SS-9182', kind: 'compliance', flag: 'verified' },
    { time: 'Today · 10:05', title: 'Accepted Terms v2.1', description: 'IP 88.156.42.18 · Chrome 132 · macOS', kind: 'consent' },
    { time: 'Today · 10:01', title: 'User Registered', description: 'via email · referral REF-A92K', kind: 'consent' },
  ];

  get filteredTimeline(): TimelineEvent[] {
    return this.timelineFilter === 'all'
      ? this.timeline
      : this.timeline.filter(event => event.kind === this.timelineFilter);
  }

  setTimelineFilter(event: Event): void {
    this.timelineFilter = (event.target as HTMLSelectElement).value;
  }

  showAction(action: string): void {
    this.notice = `${action} requires the connected account-management service.`;
  }
}
