import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEvaluationEnseignantComponent } from './create-evaluation-enseignant.component';

describe('CreateEvaluationEnseignantComponent', () => {
  let component: CreateEvaluationEnseignantComponent;
  let fixture: ComponentFixture<CreateEvaluationEnseignantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateEvaluationEnseignantComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEvaluationEnseignantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
