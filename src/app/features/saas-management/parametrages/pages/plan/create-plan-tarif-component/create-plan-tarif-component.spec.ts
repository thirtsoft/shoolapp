import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePlanTarifComponent } from './create-plan-tarif-component';

describe('CreatePlanTarifComponent', () => {
  let component: CreatePlanTarifComponent;
  let fixture: ComponentFixture<CreatePlanTarifComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePlanTarifComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreatePlanTarifComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
