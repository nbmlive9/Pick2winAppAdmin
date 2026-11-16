import { CommonModule } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Data } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ComplianceComponent } from './compliance.component';

describe('ComplianceComponent', () => {
  let routeData: BehaviorSubject<Data>;

  beforeEach(async () => {
    routeData = new BehaviorSubject<Data>({ view: 'kyc0' });
    await TestBed.configureTestingModule({
      declarations: [ComplianceComponent],
      imports: [CommonModule],
      providers: [{ provide: ActivatedRoute, useValue: { data: routeData.asObservable() } }],
    }).compileComponents();
  });

  it('filters KYC0 records and searches within the selected results', () => {
    const fixture = TestBed.createComponent(ComplianceComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.filteredRows.length).toBe(7);
    component.setFilter('under18');
    expect(component.filteredRows.length).toBe(1);
    expect(component.filteredRows[0].cells[0].text).toBe('[Blocked]');

    component.setSearchTerm('2008-11-03');
    expect(component.filteredRows.length).toBe(1);
    component.setSearchTerm('not a record');
    expect(component.filteredRows.length).toBe(0);
  });

  it('loads the selected compliance view when route data changes', () => {
    const fixture = TestBed.createComponent(ComplianceComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    routeData.next({ view: 'aml' });
    expect(component.pageKey).toBe('aml');
    expect(component.page.title).toBe('AML Monitoring');
    expect(component.filteredRows.length).toBe(7);

    component.setFilter('high');
    expect(component.filteredRows.length).toBe(3);
  });
});
