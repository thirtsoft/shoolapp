import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsDepotBancaireComponent } from './details-depot-bancaire-component';

describe('DetailsDepotBancaireComponent', () => {
  let component: DetailsDepotBancaireComponent;
  let fixture: ComponentFixture<DetailsDepotBancaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsDepotBancaireComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsDepotBancaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
