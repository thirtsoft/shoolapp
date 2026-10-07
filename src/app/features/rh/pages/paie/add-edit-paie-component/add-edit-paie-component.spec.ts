import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditPaieComponent } from './add-edit-paie-component';

describe('AddEditPaieComponent', () => {
  let component: AddEditPaieComponent;
  let fixture: ComponentFixture<AddEditPaieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditPaieComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddEditPaieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
