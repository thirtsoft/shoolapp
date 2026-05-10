import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAnneeScolaireComponent } from './create-annee-scolaire.component';

describe('CreateAnneeScolaireComponent', () => {
  let component: CreateAnneeScolaireComponent;
  let fixture: ComponentFixture<CreateAnneeScolaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateAnneeScolaireComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAnneeScolaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
