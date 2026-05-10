import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCoefficientmatclasseComponent } from './create-coefficientmatclasse.component';

describe('CreateCoefficientmatclasseComponent', () => {
  let component: CreateCoefficientmatclasseComponent;
  let fixture: ComponentFixture<CreateCoefficientmatclasseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateCoefficientmatclasseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCoefficientmatclasseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
