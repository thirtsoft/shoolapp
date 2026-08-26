import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitierAnneeScolaireComponent } from './initier-annee-scolaire-component';

describe('InitierAnneeScolaireComponent', () => {
  let component: InitierAnneeScolaireComponent;
  let fixture: ComponentFixture<InitierAnneeScolaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InitierAnneeScolaireComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InitierAnneeScolaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
