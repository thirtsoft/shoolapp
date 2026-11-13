import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsNoteInformationComponent } from './details-note-information-component';

describe('DetailsNoteInformationComponent', () => {
  let component: DetailsNoteInformationComponent;
  let fixture: ComponentFixture<DetailsNoteInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsNoteInformationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsNoteInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
