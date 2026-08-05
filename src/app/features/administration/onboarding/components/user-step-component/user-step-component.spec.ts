import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserStepComponent } from './user-step-component';

describe('UserStepComponent', () => {
  let component: UserStepComponent;
  let fixture: ComponentFixture<UserStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserStepComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
