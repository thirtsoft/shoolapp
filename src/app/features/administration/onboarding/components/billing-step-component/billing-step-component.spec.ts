import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingStepComponent } from './billing-step-component';

describe('BillingStepComponent', () => {
  let component: BillingStepComponent;
  let fixture: ComponentFixture<BillingStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillingStepComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BillingStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
