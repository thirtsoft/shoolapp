import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListUserManagementComponent } from './list-user-management-component';

describe('ListUserManagementComponent', () => {
  let component: ListUserManagementComponent;
  let fixture: ComponentFixture<ListUserManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListUserManagementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListUserManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
