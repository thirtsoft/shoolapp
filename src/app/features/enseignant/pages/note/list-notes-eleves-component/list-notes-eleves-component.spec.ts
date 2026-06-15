import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListNotesElevesComponent } from './list-notes-eleves-component';

describe('ListNotesElevesComponent', () => {
  let component: ListNotesElevesComponent;
  let fixture: ComponentFixture<ListNotesElevesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListNotesElevesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListNotesElevesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
