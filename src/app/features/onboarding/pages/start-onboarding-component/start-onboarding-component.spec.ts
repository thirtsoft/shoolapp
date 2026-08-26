import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartOnboardingComponent } from './start-onboarding-component';

describe('StartOnboardingComponent', () => {
  let component: StartOnboardingComponent;
  let fixture: ComponentFixture<StartOnboardingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartOnboardingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StartOnboardingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
