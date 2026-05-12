import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListNoteEleveComponent } from './list-note-eleve.component';

describe('ListNoteEleveComponent', () => {
  let component: ListNoteEleveComponent;
  let fixture: ComponentFixture<ListNoteEleveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListNoteEleveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListNoteEleveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
