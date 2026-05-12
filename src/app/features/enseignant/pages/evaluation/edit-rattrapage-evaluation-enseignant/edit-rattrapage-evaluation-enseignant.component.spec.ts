import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRattrapageEvaluationEnseignantComponent } from './edit-rattrapage-evaluation-enseignant.component';

describe('EditRattrapageEvaluationEnseignantComponent', () => {
  let component: EditRattrapageEvaluationEnseignantComponent;
  let fixture: ComponentFixture<EditRattrapageEvaluationEnseignantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditRattrapageEvaluationEnseignantComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditRattrapageEvaluationEnseignantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
