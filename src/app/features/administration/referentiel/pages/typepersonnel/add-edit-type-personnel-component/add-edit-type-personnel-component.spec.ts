import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditTypePersonnelComponent } from './add-edit-type-personnel-component';

describe('AddEditTypePersonnelComponent', () => {
  let component: AddEditTypePersonnelComponent;
  let fixture: ComponentFixture<AddEditTypePersonnelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditTypePersonnelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddEditTypePersonnelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
