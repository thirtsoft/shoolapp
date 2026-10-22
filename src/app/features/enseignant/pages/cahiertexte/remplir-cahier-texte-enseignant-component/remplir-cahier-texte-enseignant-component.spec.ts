import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemplirCahierTexteEnseignantComponent } from './remplir-cahier-texte-enseignant-component';

describe('RemplirCahierTexteEnseignantComponent', () => {
  let component: RemplirCahierTexteEnseignantComponent;
  let fixture: ComponentFixture<RemplirCahierTexteEnseignantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemplirCahierTexteEnseignantComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RemplirCahierTexteEnseignantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
