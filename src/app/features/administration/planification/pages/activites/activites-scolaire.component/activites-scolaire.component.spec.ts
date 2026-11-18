import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivitesScolaireComponent } from './activites-scolaire.component';

describe('ActivitesScolaireComponent', () => {
  let component: ActivitesScolaireComponent;
  let fixture: ComponentFixture<ActivitesScolaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivitesScolaireComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivitesScolaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
