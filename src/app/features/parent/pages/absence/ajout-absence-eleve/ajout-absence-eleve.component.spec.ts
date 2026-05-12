import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjoutAbsenceEleveComponent } from './ajout-absence-eleve.component';

describe('AjoutAbsenceEleveComponent', () => {
  let component: AjoutAbsenceEleveComponent;
  let fixture: ComponentFixture<AjoutAbsenceEleveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AjoutAbsenceEleveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AjoutAbsenceEleveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
