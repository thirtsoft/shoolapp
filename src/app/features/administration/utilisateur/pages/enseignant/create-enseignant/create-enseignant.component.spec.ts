import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEnseignantComponent } from './create-enseignant.component';

describe('CreateEnseignantComponent', () => {
  let component: CreateEnseignantComponent;
  let fixture: ComponentFixture<CreateEnseignantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateEnseignantComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEnseignantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
