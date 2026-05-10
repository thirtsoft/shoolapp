import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNiveauEducationComponent } from './create-niveau-education.component';

describe('CreateNiveauEducationComponent', () => {
  let component: CreateNiveauEducationComponent;
  let fixture: ComponentFixture<CreateNiveauEducationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateNiveauEducationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateNiveauEducationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
