import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsDemandeAvanceSalaireComponent } from './details-demande-avance-salaire-component';

describe('DetailsDemandeAvanceSalaireComponent', () => {
  let component: DetailsDemandeAvanceSalaireComponent;
  let fixture: ComponentFixture<DetailsDemandeAvanceSalaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsDemandeAvanceSalaireComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsDemandeAvanceSalaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
