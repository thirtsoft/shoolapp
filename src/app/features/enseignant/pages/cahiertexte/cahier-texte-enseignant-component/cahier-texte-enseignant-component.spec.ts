import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CahierTexteEnseignantComponent } from './cahier-texte-enseignant-component';

describe('CahierTexteEnseignantComponent', () => {
  let component: CahierTexteEnseignantComponent;
  let fixture: ComponentFixture<CahierTexteEnseignantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CahierTexteEnseignantComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CahierTexteEnseignantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
