import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingProgressComponent } from './onboarding-progress-component';

describe('OnboardingProgressComponent', () => {
  let component: OnboardingProgressComponent;
  let fixture: ComponentFixture<OnboardingProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingProgressComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
