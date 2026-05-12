import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteInformationComponent } from './note-information.component';

describe('NoteInformationComponent', () => {
  let component: NoteInformationComponent;
  let fixture: ComponentFixture<NoteInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoteInformationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoteInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
