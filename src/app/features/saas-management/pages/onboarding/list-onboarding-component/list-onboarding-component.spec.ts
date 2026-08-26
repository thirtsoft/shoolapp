import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOnboardingComponent } from './list-onboarding-component';

describe('ListOnboardingComponent', () => {
  let component: ListOnboardingComponent;
  let fixture: ComponentFixture<ListOnboardingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListOnboardingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListOnboardingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
