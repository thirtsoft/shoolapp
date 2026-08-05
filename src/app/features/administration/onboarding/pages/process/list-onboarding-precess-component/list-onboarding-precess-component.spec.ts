import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOnboardingPrecessComponent } from './list-onboarding-precess-component';

describe('ListOnboardingPrecessComponent', () => {
  let component: ListOnboardingPrecessComponent;
  let fixture: ComponentFixture<ListOnboardingPrecessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListOnboardingPrecessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListOnboardingPrecessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
