import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListNoteClasseComponent } from './list-note-classe.component';

describe('ListNoteClasseComponent', () => {
  let component: ListNoteClasseComponent;
  let fixture: ComponentFixture<ListNoteClasseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListNoteClasseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListNoteClasseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
