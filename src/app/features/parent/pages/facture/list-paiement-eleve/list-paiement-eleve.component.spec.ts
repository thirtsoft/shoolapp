import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPaiementEleveComponent } from './list-paiement-eleve.component';

describe('ListPaiementEleveComponent', () => {
  let component: ListPaiementEleveComponent;
  let fixture: ComponentFixture<ListPaiementEleveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListPaiementEleveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListPaiementEleveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
