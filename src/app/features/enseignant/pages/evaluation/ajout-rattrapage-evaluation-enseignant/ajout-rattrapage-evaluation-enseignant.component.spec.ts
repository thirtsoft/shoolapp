import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjoutRattrapageEvaluationEnseignantComponent } from './ajout-rattrapage-evaluation-enseignant.component';

describe('AjoutRattrapageEvaluationEnseignantComponent', () => {
  let component: AjoutRattrapageEvaluationEnseignantComponent;
  let fixture: ComponentFixture<AjoutRattrapageEvaluationEnseignantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AjoutRattrapageEvaluationEnseignantComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AjoutRattrapageEvaluationEnseignantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
