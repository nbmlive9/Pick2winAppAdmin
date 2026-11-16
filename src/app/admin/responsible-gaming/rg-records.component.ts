import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { asapScheduler, Subscription } from 'rxjs';
import { observeOn } from 'rxjs/operators';
import { RgRecordsPage } from './rg.models';
import { rgRecordsPages, RgRecordsView } from './rg-records.data';

@Component({
  selector: 'app-rg-records',
  templateUrl: './rg-records.component.html',
  styleUrls: ['./rg-records.component.css'],
})
export class RgRecordsComponent implements OnInit, OnDestroy {
  page: RgRecordsPage = rgRecordsPages['deposit-limits'];
  activeFilter = 'all';
  searchTerm = '';
  notice = '';
  private routeData?: Subscription;

  constructor(private route: ActivatedRoute) {
    this.setPage(this.route.snapshot.data['view'] as RgRecordsView | undefined);
  }

  get filteredRows() {
    const query = this.searchTerm.trim().toLowerCase();
    return this.page.rows.filter(row => {
      const matchesFilter = this.activeFilter === 'all' || row.filters.includes(this.activeFilter);
      const searchableText = `${row.name} ${row.id} ${row.cells.map(cell => cell.value).join(' ')}`;
      return matchesFilter && (!query || searchableText.toLowerCase().includes(query));
    });
  }

  ngOnInit(): void {
    this.routeData = this.route.data.pipe(observeOn(asapScheduler))
      .subscribe(data => this.setPage(data['view'] as RgRecordsView | undefined));
  }

  private setPage(view: RgRecordsView | undefined): void {
    if (!view) {
      return;
    }

    this.page = rgRecordsPages[view];
    this.activeFilter = 'all';
    this.notice = '';
  }

  setSearchTerm(value: string): void {
    this.searchTerm = value;
  }

  getInitials(name: string): string {
    return name.startsWith('[')
      ? '?'
      : name.split(' ').map(part => part[0]).join('').slice(0, 2);
  }

  setFilter(key: string): void {
    this.activeFilter = key;
  }

  handleTopbarAction(action: 'primary' | 'secondary'): void {
    if (action === 'primary' && this.page.primaryAction.toLowerCase().includes('export')) {
      this.exportCsv();
      return;
    }

    this.notice = `${action === 'primary' ? this.page.primaryAction : this.page.secondaryAction} selected.`;
  }

  handleRowAction(action: string, user: string): void {
    this.notice = `${action} selected for ${user}.`;
  }

  exportCsv(): void {
    const headers = ['User', 'User ID', ...this.page.columns];
    const records = this.filteredRows.map(row => [
      row.name,
      row.id,
      ...row.cells.map(cell => cell.value),
    ]);
    const escape = (value: string): string => `"${value.replace(/"/g, '""')}"`;
    const csv = [headers, ...records].map(values => values.map(escape).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.page.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  ngOnDestroy(): void {
    this.routeData?.unsubscribe();
  }
}
