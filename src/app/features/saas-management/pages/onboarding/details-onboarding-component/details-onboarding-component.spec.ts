import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsOnboardingComponent } from './details-onboarding-component';

describe('DetailsOnboardingComponent', () => {
  let component: DetailsOnboardingComponent;
  let fixture: ComponentFixture<DetailsOnboardingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsOnboardingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsOnboardingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
