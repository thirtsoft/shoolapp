import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericTableReferentielComponent } from './generic-table-referentiel.component';

describe('GenericTableReferentielComponent', () => {
  let component: GenericTableReferentielComponent;
  let fixture: ComponentFixture<GenericTableReferentielComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenericTableReferentielComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericTableReferentielComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
