import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreationEvaluationComponent } from './creation-evaluation.component';

describe('CreationEvaluationComponent', () => {
  let component: CreationEvaluationComponent;
  let fixture: ComponentFixture<CreationEvaluationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreationEvaluationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreationEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
