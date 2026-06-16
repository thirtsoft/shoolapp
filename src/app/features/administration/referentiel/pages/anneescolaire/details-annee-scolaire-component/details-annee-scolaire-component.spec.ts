import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsAnneeScolaireComponent } from './details-annee-scolaire-component';

describe('DetailsAnneeScolaireComponent', () => {
  let component: DetailsAnneeScolaireComponent;
  let fixture: ComponentFixture<DetailsAnneeScolaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsAnneeScolaireComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsAnneeScolaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
