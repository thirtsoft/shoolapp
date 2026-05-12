import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListEleveEnseignantComponent } from './list-eleve-enseignant.component';

describe('ListEleveEnseignantComponent', () => {
  let component: ListEleveEnseignantComponent;
  let fixture: ComponentFixture<ListEleveEnseignantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListEleveEnseignantComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListEleveEnseignantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
