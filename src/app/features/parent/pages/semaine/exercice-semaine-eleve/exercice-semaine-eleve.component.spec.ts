import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciceSemaineEleveComponent } from './exercice-semaine-eleve.component';

describe('ExerciceSemaineEleveComponent', () => {
  let component: ExerciceSemaineEleveComponent;
  let fixture: ComponentFixture<ExerciceSemaineEleveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExerciceSemaineEleveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExerciceSemaineEleveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
