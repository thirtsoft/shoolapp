import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOnboardingComponent } from './create-onboarding-component';

describe('CreateOnboardingComponent', () => {
  let component: CreateOnboardingComponent;
  let fixture: ComponentFixture<CreateOnboardingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateOnboardingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateOnboardingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
