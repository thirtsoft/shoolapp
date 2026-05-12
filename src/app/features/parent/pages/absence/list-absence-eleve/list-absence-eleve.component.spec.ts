import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListAbsenceEleveComponent } from './list-absence-eleve.component';

describe('ListAbsenceEleveComponent', () => {
  let component: ListAbsenceEleveComponent;
  let fixture: ComponentFixture<ListAbsenceEleveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListAbsenceEleveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListAbsenceEleveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
