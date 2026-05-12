import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListInvoiceEleveComponent } from './list-invoice-eleve.component';

describe('ListInvoiceEleveComponent', () => {
  let component: ListInvoiceEleveComponent;
  let fixture: ComponentFixture<ListInvoiceEleveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListInvoiceEleveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListInvoiceEleveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
