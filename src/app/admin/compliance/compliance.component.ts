import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { getCompliancePage } from './compliance.data';
import { CompliancePage, ComplianceRow } from './compliance.models';

@Component({
  selector: 'app-compliance',
  templateUrl: './compliance.component.html',
  styleUrls: ['./compliance.component.css'],
})
export class ComplianceComponent implements OnInit, OnDestroy {
  private routeData?: Subscription;
  page: CompliancePage = getCompliancePage('cases');
  pageKey = 'cases';
  activeFilter = 'all';
  searchTerm = '';
  notice = '';

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    this.routeData = this.route.data.subscribe(data => {
      this.pageKey = data['view'] || 'cases';
      this.page = getCompliancePage(this.pageKey);
      this.activeFilter = 'all';
      this.notice = '';
    });
  }

  get filteredRows(): ComplianceRow[] {
    const query = this.searchTerm.trim().toLowerCase();
    return this.page.rows.filter(row => {
      const filterMatch = this.activeFilter === 'all' || row.filters.includes(this.activeFilter);
      const queryMatch = !query || row.cells.some(cell =>
        `${cell.text} ${cell.id || ''}`.toLowerCase().includes(query));
      return filterMatch && queryMatch;
    });
  }

  setSearchTerm(value: string): void {
    this.searchTerm = value;
  }

  setFilter(key: string): void {
    this.activeFilter = key;
  }

  handleTopbarAction(action: 'primary' | 'secondary'): void {
    const label = action === 'primary' ? this.page.primaryAction : this.page.secondaryAction;
    this.notice = `${label} selected.`;
  }

  handleRowAction(label: string, row: ComplianceRow): void {
    const person = row.cells.find(cell => cell.kind === 'person');
    this.notice = `${label} selected${person ? ` for ${person.text}` : ''}.`;
  }

  trackByIndex(index: number): number {
    return index;
  }

  ngOnDestroy(): void {
    this.routeData?.unsubscribe();
  }
}
