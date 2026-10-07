import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditDemandeAvanceSalaireComponent } from './add-edit-demande-avance-salaire-component';

describe('AddEditDemandeAvanceSalaireComponent', () => {
  let component: AddEditDemandeAvanceSalaireComponent;
  let fixture: ComponentFixture<AddEditDemandeAvanceSalaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditDemandeAvanceSalaireComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddEditDemandeAvanceSalaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
