import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeAbsenceComponent } from './liste-absence.component';

describe('ListeAbsenceComponent', () => {
  let component: ListeAbsenceComponent;
  let fixture: ComponentFixture<ListeAbsenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListeAbsenceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListeAbsenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
