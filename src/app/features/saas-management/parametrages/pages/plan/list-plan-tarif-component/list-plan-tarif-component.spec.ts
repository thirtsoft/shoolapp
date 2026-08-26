import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPlanTarifComponent } from './list-plan-tarif-component';

describe('ListPlanTarifComponent', () => {
  let component: ListPlanTarifComponent;
  let fixture: ComponentFixture<ListPlanTarifComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPlanTarifComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListPlanTarifComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
