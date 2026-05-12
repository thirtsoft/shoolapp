import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditEvaluationEnseignantComponent } from './edit-evaluation-enseignant.component';

describe('EditEvaluationEnseignantComponent', () => {
  let component: EditEvaluationEnseignantComponent;
  let fixture: ComponentFixture<EditEvaluationEnseignantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditEvaluationEnseignantComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditEvaluationEnseignantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
