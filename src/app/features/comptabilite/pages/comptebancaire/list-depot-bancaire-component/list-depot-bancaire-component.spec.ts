import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListDepotBancaireComponent } from './list-depot-bancaire-component';

describe('ListDepotBancaireComponent', () => {
  let component: ListDepotBancaireComponent;
  let fixture: ComponentFixture<ListDepotBancaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListDepotBancaireComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListDepotBancaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
