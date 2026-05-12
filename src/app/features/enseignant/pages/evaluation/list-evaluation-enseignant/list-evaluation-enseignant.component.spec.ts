import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListEvaluationEnseignantComponent } from './list-evaluation-enseignant.component';

describe('ListEvaluationEnseignantComponent', () => {
  let component: ListEvaluationEnseignantComponent;
  let fixture: ComponentFixture<ListEvaluationEnseignantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListEvaluationEnseignantComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListEvaluationEnseignantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
