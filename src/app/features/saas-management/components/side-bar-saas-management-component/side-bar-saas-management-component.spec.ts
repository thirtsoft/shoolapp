import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideBarSaasManagementComponent } from './side-bar-saas-management-component';

describe('SideBarSaasManagementComponent', () => {
  let component: SideBarSaasManagementComponent;
  let fixture: ComponentFixture<SideBarSaasManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideBarSaasManagementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SideBarSaasManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
