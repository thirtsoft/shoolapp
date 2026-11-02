import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCompteBancaireComponent } from './list-compte-bancaire-component';

describe('ListCompteBancaireComponent', () => {
  let component: ListCompteBancaireComponent;
  let fixture: ComponentFixture<ListCompteBancaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListCompteBancaireComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListCompteBancaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
