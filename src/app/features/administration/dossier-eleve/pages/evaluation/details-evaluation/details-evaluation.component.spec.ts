import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsEvaluationComponent } from './details-evaluation.component';

describe('DetailsEvaluationComponent', () => {
  let component: DetailsEvaluationComponent;
  let fixture: ComponentFixture<DetailsEvaluationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailsEvaluationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
