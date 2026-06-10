import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationClasseComponent } from './evaluation-classe-component';

describe('EvaluationClasseComponent', () => {
  let component: EvaluationClasseComponent;
  let fixture: ComponentFixture<EvaluationClasseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluationClasseComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EvaluationClasseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
