import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEcoleAdminComponent } from './create-ecole-admin.component';

describe('CreateEcoleAdminComponent', () => {
  let component: CreateEcoleAdminComponent;
  let fixture: ComponentFixture<CreateEcoleAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateEcoleAdminComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEcoleAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
