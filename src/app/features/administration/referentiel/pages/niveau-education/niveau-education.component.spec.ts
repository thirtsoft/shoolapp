import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NiveauEducationComponent } from './niveau-education.component';

describe('NiveauEducationComponent', () => {
  let component: NiveauEducationComponent;
  let fixture: ComponentFixture<NiveauEducationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NiveauEducationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NiveauEducationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
