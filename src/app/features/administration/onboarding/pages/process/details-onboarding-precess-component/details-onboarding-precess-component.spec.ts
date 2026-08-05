import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsOnboardingPrecessComponent } from './details-onboarding-precess-component';

describe('DetailsOnboardingPrecessComponent', () => {
  let component: DetailsOnboardingPrecessComponent;
  let fixture: ComponentFixture<DetailsOnboardingPrecessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsOnboardingPrecessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsOnboardingPrecessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
