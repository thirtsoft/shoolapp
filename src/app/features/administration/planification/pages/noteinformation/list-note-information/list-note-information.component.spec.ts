import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListNoteInformationComponent } from './list-note-information.component';

describe('ListNoteInformationComponent', () => {
  let component: ListNoteInformationComponent;
  let fixture: ComponentFixture<ListNoteInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListNoteInformationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListNoteInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
