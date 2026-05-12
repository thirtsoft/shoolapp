import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAbsenceEleveEnseignantComponent } from './create-absence-eleve-enseignant.component';

describe('CreateAbsenceEleveEnseignantComponent', () => {
  let component: CreateAbsenceEleveEnseignantComponent;
  let fixture: ComponentFixture<CreateAbsenceEleveEnseignantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateAbsenceEleveEnseignantComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAbsenceEleveEnseignantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
