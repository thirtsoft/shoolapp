import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeatilEvaluationClasseComponent } from './deatil-evaluation-classe-component';

describe('DeatilEvaluationClasseComponent', () => {
  let component: DeatilEvaluationClasseComponent;
  let fixture: ComponentFixture<DeatilEvaluationClasseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeatilEvaluationClasseComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DeatilEvaluationClasseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
