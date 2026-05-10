import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPaiementComponent } from './list-paiement.component';

describe('ListPaiementComponent', () => {
  let component: ListPaiementComponent;
  let fixture: ComponentFixture<ListPaiementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListPaiementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListPaiementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
