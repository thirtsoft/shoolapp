import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaisirNotesEleveComponent } from './saisir-notes-eleve-component';

describe('SaisirNotesEleveComponent', () => {
  let component: SaisirNotesEleveComponent;
  let fixture: ComponentFixture<SaisirNotesEleveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaisirNotesEleveComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SaisirNotesEleveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
