import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionStepComponent } from './subscription-step-component';

describe('SubscriptionStepComponent', () => {
  let component: SubscriptionStepComponent;
  let fixture: ComponentFixture<SubscriptionStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionStepComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SubscriptionStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
