import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationEleveComponent } from './evaluation-eleve.component';

describe('EvaluationEleveComponent', () => {
  let component: EvaluationEleveComponent;
  let fixture: ComponentFixture<EvaluationEleveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EvaluationEleveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluationEleveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
