import { CommonModule } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { WithdrawalReviewComponent } from './withdrawal-review.component';

describe('WithdrawalReviewComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WithdrawalReviewComponent],
      imports: [CommonModule],
    }).compileComponents();
  });

  it('filters flagged requests and supports selecting a withdrawal', () => {
    const fixture = TestBed.createComponent(WithdrawalReviewComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.setFilter('flagged');
    expect(component.filteredWithdrawals.length).toBe(3);

    const selected = component.filteredWithdrawals[0];
    component.selectWithdrawal(selected);
    expect(component.selectedWithdrawal.id).toBe(selected.id);

    const event = new Event('click');
    component.toggleSelected(selected, event);
    expect(component.selectedIds.has(selected.id)).toBe(true);
  });
});
