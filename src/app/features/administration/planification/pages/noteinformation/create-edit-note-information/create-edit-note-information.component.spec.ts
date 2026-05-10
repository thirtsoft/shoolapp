import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditNoteInformationComponent } from './create-edit-note-information.component';

describe('CreateEditNoteInformationComponent', () => {
  let component: CreateEditNoteInformationComponent;
  let fixture: ComponentFixture<CreateEditNoteInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateEditNoteInformationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEditNoteInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
