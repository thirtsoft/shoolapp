import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailEvaluationEnseignantComponent } from './detail-evaluation-enseignant.component';

describe('DetailEvaluationEnseignantComponent', () => {
  let component: DetailEvaluationEnseignantComponent;
  let fixture: ComponentFixture<DetailEvaluationEnseignantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailEvaluationEnseignantComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailEvaluationEnseignantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
