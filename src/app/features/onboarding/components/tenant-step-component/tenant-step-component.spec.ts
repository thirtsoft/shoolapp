import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantStepComponent } from './tenant-step-component';

describe('TenantStepComponent', () => {
  let component: TenantStepComponent;
  let fixture: ComponentFixture<TenantStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantStepComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TenantStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
