import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoefficientmatclasseComponent } from './coefficientmatclasse.component';

describe('CoefficientmatclasseComponent', () => {
  let component: CoefficientmatclasseComponent;
  let fixture: ComponentFixture<CoefficientmatclasseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoefficientmatclasseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoefficientmatclasseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
