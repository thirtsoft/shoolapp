import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditTypeContratComponent } from './add-edit-type-contrat-component';

describe('AddEditTypeContratComponent', () => {
  let component: AddEditTypeContratComponent;
  let fixture: ComponentFixture<AddEditTypeContratComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditTypeContratComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddEditTypeContratComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
