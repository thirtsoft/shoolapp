import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMatiereAvecCoefficientComponent } from './create-matiere-avec-coefficient.component';

describe('CreateMatiereAvecCoefficientComponent', () => {
  let component: CreateMatiereAvecCoefficientComponent;
  let fixture: ComponentFixture<CreateMatiereAvecCoefficientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateMatiereAvecCoefficientComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateMatiereAvecCoefficientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
