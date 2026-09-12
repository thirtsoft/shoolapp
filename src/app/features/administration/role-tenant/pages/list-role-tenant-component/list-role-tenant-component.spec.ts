import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListRoleTenantComponent } from './list-role-tenant-component';

describe('ListRoleTenantComponent', () => {
  let component: ListRoleTenantComponent;
  let fixture: ComponentFixture<ListRoleTenantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListRoleTenantComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListRoleTenantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
