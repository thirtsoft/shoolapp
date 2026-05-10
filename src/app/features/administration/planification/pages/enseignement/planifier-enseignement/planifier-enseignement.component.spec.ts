import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanifierEnseignementComponent } from './planifier-enseignement.component';

describe('PlanifierEnseignementComponent', () => {
  let component: PlanifierEnseignementComponent;
  let fixture: ComponentFixture<PlanifierEnseignementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanifierEnseignementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanifierEnseignementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
