import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreationNoteComponent } from './creation-note.component';

describe('CreationNoteComponent', () => {
  let component: CreationNoteComponent;
  let fixture: ComponentFixture<CreationNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreationNoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreationNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
