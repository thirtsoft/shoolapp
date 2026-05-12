import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciceAFaireComponent } from './exercice-a-faire.component';

describe('ExerciceAFaireComponent', () => {
  let component: ExerciceAFaireComponent;
  let fixture: ComponentFixture<ExerciceAFaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExerciceAFaireComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExerciceAFaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
