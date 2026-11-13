import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteInofoComponent } from './note-inofo-component';

describe('NoteInofoComponent', () => {
  let component: NoteInofoComponent;
  let fixture: ComponentFixture<NoteInofoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoteInofoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NoteInofoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
