import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsEleveEnseignantComponent } from './details-eleve-enseignant.component';

describe('DetailsEleveEnseignantComponent', () => {
  let component: DetailsEleveEnseignantComponent;
  let fixture: ComponentFixture<DetailsEleveEnseignantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailsEleveEnseignantComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsEleveEnseignantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
