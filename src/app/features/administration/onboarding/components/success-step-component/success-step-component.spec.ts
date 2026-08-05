import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessStepComponent } from './success-step-component';

describe('SuccessStepComponent', () => {
  let component: SuccessStepComponent;
  let fixture: ComponentFixture<SuccessStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessStepComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SuccessStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
