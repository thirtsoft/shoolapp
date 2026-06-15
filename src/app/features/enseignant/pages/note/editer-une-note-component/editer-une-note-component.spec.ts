import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditerUneNoteComponent } from './editer-une-note-component';

describe('EditerUneNoteComponent', () => {
  let component: EditerUneNoteComponent;
  let fixture: ComponentFixture<EditerUneNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditerUneNoteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditerUneNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
