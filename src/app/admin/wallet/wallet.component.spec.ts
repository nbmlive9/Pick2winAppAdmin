import { CommonModule } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Data } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { WalletMetricCardComponent } from './wallet-metric-card.component';
import { WalletComponent } from './wallet.component';

describe('WalletComponent', () => {
  let routeData: BehaviorSubject<Data>;

  beforeEach(async () => {
    routeData = new BehaviorSubject<Data>({ view: 'deposits' });
    await TestBed.configureTestingModule({
      declarations: [WalletComponent, WalletMetricCardComponent],
      imports: [CommonModule],
      providers: [{ provide: ActivatedRoute, useValue: { data: routeData.asObservable() } }],
    }).compileComponents();
  });

  it('filters deposits by method and global search', () => {
    const fixture = TestBed.createComponent(WalletComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.filteredDeposits.length).toBe(8);
    component.setFilter('bank');
    expect(component.filteredDeposits.length).toBe(3);

    component.setSearchTerm('Sara');
    expect(component.filteredDeposits.length).toBe(1);
    expect(component.filteredDeposits[0].id).toBe('UK-49021');
    component.setSearchTerm('not a deposit');
    expect(component.filteredDeposits.length).toBe(0);
  });

  it('loads the selected route view and resets its filter', () => {
    const fixture = TestBed.createComponent(WalletComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    component.setFilter('bank');

    routeData.next({ view: 'transactions' });
    expect(component.view).toBe('transactions');
    expect(component.activeFilter).toBe('all');
    expect(component.filteredLedger.length).toBe(8);

    component.setFilter('contest');
    expect(component.filteredLedger.length).toBe(3);
  });
});
