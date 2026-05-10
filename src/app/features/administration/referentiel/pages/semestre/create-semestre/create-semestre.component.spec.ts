import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSemestreComponent } from './create-semestre.component';

describe('CreateSemestreComponent', () => {
  let component: CreateSemestreComponent;
  let fixture: ComponentFixture<CreateSemestreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateSemestreComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSemestreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
