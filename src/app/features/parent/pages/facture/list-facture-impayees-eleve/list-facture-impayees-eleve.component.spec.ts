import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListFactureImpayeesEleveComponent } from './list-facture-impayees-eleve.component';

describe('ListFactureImpayeesEleveComponent', () => {
  let component: ListFactureImpayeesEleveComponent;
  let fixture: ComponentFixture<ListFactureImpayeesEleveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListFactureImpayeesEleveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListFactureImpayeesEleveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
