import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainLayoutSaasManagementComponent } from './main-layout-saas-management-component';

describe('MainLayoutSaasManagementComponent', () => {
  let component: MainLayoutSaasManagementComponent;
  let fixture: ComponentFixture<MainLayoutSaasManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayoutSaasManagementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutSaasManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
