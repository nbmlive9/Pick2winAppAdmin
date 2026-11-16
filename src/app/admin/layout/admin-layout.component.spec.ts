import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { AdminLayoutComponent } from './admin-layout.component';

describe('AdminLayoutComponent navigation', () => {
  let fixture: ComponentFixture<AdminLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminLayoutComponent],
      imports: [CommonModule, RouterTestingModule],
      providers: [{
        provide: AuthService,
        useValue: { user$: of({ name: 'Admin User', role: 'super_admin' }) },
      }],
    }).compileComponents();
    fixture = TestBed.createComponent(AdminLayoutComponent);
    fixture.detectChanges();
  });

  it('keeps every navigation submenu closed until explicitly clicked', () => {
    const component = fixture.componentInstance;
    expect(component.usersExpanded).toBeFalse();
    expect(component.rgExpanded).toBeFalse();
    expect(component.complianceExpanded).toBeFalse();
    expect(component.walletExpanded).toBeFalse();
    expect(component.footballExpanded).toBeFalse();
    expect(fixture.nativeElement.querySelector('#users-subnav')).toBeNull();
    expect(fixture.nativeElement.querySelector('#compliance-subnav')).toBeNull();
    expect(fixture.nativeElement.querySelector('#wallet-subnav')).toBeNull();
    expect(fixture.nativeElement.querySelector('#football-subnav')).toBeNull();

    const walletToggle = fixture.nativeElement.querySelector(
      '[aria-label="Toggle Finance and Wallet menu"]',
    ) as HTMLButtonElement;
    walletToggle.click();
    fixture.detectChanges();

    expect(component.walletExpanded).toBeTrue();
    expect(fixture.nativeElement.querySelector('#wallet-subnav')).not.toBeNull();

    const footballToggle = fixture.nativeElement.querySelector(
      '[aria-label="Toggle Football Operations menu"]',
    ) as HTMLButtonElement;
    footballToggle.click();
    fixture.detectChanges();

    expect(component.footballExpanded).toBeTrue();
    expect(fixture.nativeElement.querySelector('#football-subnav')).not.toBeNull();
  });
});
