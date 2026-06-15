import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsNoteInformationComponenent } from './details-note-information-componenent';

describe('DetailsNoteInformationComponenent', () => {
  let component: DetailsNoteInformationComponenent;
  let fixture: ComponentFixture<DetailsNoteInformationComponenent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsNoteInformationComponenent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsNoteInformationComponenent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
