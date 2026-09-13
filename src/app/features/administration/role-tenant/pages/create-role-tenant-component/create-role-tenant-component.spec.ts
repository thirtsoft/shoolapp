import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRoleTenantComponent } from './create-role-tenant-component';

describe('CreateRoleTenantComponent', () => {
  let component: CreateRoleTenantComponent;
  let fixture: ComponentFixture<CreateRoleTenantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateRoleTenantComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateRoleTenantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
