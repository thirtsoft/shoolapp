import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPasswordEnseignantComponent } from './edit-password-enseignant-component';

describe('EditPasswordEnseignantComponent', () => {
  let component: EditPasswordEnseignantComponent;
  let fixture: ComponentFixture<EditPasswordEnseignantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPasswordEnseignantComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditPasswordEnseignantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
