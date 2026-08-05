import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationStepComponent } from './organization-step-component';

describe('OrganizationStepComponent', () => {
  let component: OrganizationStepComponent;
  let fixture: ComponentFixture<OrganizationStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationStepComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
