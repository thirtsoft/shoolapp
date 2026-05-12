import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRattrapageEvaluationComponent } from './edit-rattrapage-evaluation.component';

describe('EditRattrapageEvaluationComponent', () => {
  let component: EditRattrapageEvaluationComponent;
  let fixture: ComponentFixture<EditRattrapageEvaluationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditRattrapageEvaluationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditRattrapageEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
