import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreationExerciceComponent } from './creation-exercice.component';

describe('CreationExerciceComponent', () => {
  let component: CreationExerciceComponent;
  let fixture: ComponentFixture<CreationExerciceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreationExerciceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreationExerciceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
