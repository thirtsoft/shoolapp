import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParametrageEcoleAdminComponent } from './parametrage-ecole-admin.component';

describe('ParametrageEcoleAdminComponent', () => {
  let component: ParametrageEcoleAdminComponent;
  let fixture: ComponentFixture<ParametrageEcoleAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParametrageEcoleAdminComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParametrageEcoleAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
