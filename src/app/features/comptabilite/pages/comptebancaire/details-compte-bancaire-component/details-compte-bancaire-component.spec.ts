import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsCompteBancaireComponent } from './details-compte-bancaire-component';

describe('DetailsCompteBancaireComponent', () => {
  let component: DetailsCompteBancaireComponent;
  let fixture: ComponentFixture<DetailsCompteBancaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsCompteBancaireComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsCompteBancaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
