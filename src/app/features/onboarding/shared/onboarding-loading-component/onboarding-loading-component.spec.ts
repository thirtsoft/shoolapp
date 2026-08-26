import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingLoadingComponent } from './onboarding-loading-component';

describe('OnboardingLoadingComponent', () => {
  let component: OnboardingLoadingComponent;
  let fixture: ComponentFixture<OnboardingLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnboardingLoadingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
