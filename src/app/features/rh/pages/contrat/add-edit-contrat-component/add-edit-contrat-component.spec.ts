import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditContratComponent } from './add-edit-contrat-component';

describe('AddEditContratComponent', () => {
  let component: AddEditContratComponent;
  let fixture: ComponentFixture<AddEditContratComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditContratComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddEditContratComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
