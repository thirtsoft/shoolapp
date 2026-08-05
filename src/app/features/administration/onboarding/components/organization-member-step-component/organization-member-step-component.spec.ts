import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationMemberStepComponent } from './organization-member-step-component';

describe('OrganizationMemberStepComponent', () => {
  let component: OrganizationMemberStepComponent;
  let fixture: ComponentFixture<OrganizationMemberStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationMemberStepComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationMemberStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
