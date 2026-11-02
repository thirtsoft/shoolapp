import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsExerciceComponent } from './details-exercice-component';

describe('DetailsExerciceComponent', () => {
  let component: DetailsExerciceComponent;
  let fixture: ComponentFixture<DetailsExerciceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsExerciceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsExerciceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
