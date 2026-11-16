import { Component } from '@angular/core';

interface SupportTicket {
  id: string;
  initials: string;
  user: string;
  subject: string;
  category: string;
  categoryTone: string;
  age: string;
  priority: 'high' | 'medium' | 'low';
  replies: number;
  selected?: boolean;
}

@Component({
  selector: 'app-support-tickets',
  templateUrl: './support-tickets.component.html',
  styleUrls: ['./support-tickets.component.css'],
})
export class SupportTicketsComponent {
  readonly queues = [
    { label: 'All Tickets', count: '127', active: true },
    { label: 'My Assigned', count: '24' },
    { label: 'Unassigned', count: '38' },
    { label: 'Escalated', count: '9', urgent: true },
  ];

  readonly categories = [
    { label: 'Wallet Issues', count: 32, color: '#5b8def' },
    { label: 'Withdrawal Issues', count: 24, color: '#ff3b47' },
    { label: 'KYC Issues', count: 18, color: '#a78bfa' },
    { label: 'Contest Issues', count: 21, color: '#ffb627' },
    { label: 'Technical Support', count: 14, color: '#2bd4a1' },
    { label: 'Bonus Disputes', count: 11, color: '#ff6478' },
    { label: 'RG Complaints', count: 7, color: '#ff8c95' },
  ];

  readonly tickets: SupportTicket[] = [
    { selected: true, id: 'TKT-2118', initials: 'DF', user: 'Daniel Foster', subject: 'Withdrawal stuck — pending 6h', category: 'Withdrawal', categoryTone: 'red', age: '2h', priority: 'high', replies: 3 },
    { id: 'TKT-2117', initials: 'AK', user: 'Aaron Khouri', subject: 'Multiple account claim — appeal', category: 'Compliance', categoryTone: 'violet', age: '2h', priority: 'high', replies: 8 },
    { id: 'TKT-2116', initials: 'HM', user: 'Helena Moss', subject: 'Bonus expired before contest result', category: 'Bonus', categoryTone: 'pink', age: '4h', priority: 'medium', replies: 2 },
    { id: 'TKT-2115', initials: 'SP', user: 'Sara Park', subject: 'KYC1 selfie rejected — re-upload', category: 'KYC', categoryTone: 'violet', age: '5h', priority: 'medium', replies: 1 },
    { id: 'TKT-2114', initials: 'MR', user: 'Marcus Reed', subject: 'Contest scoring discrepancy', category: 'Contest', categoryTone: 'amber', age: '8h', priority: 'medium', replies: 4 },
    { id: 'TKT-2113', initials: 'IA', user: 'Imogen Ash', subject: 'App crash on iOS 17.4', category: 'Tech', categoryTone: 'green', age: '1d', priority: 'low', replies: 2 },
    { id: 'TKT-2112', initials: 'TW', user: 'Tom Whitlock', subject: 'SoF docs uploaded — chase up', category: 'Compliance', categoryTone: 'violet', age: '1d', priority: 'low', replies: 6 },
  ];
}
