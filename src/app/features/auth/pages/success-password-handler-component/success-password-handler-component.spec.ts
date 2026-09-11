import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessPasswordHandlerComponent } from './success-password-handler-component';

describe('SuccessPasswordHandlerComponent', () => {
  let component: SuccessPasswordHandlerComponent;
  let fixture: ComponentFixture<SuccessPasswordHandlerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessPasswordHandlerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SuccessPasswordHandlerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
