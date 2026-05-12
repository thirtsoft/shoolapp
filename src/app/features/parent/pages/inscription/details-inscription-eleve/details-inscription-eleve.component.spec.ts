import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsInscriptionEleveComponent } from './details-inscription-eleve.component';

describe('DetailsInscriptionEleveComponent', () => {
  let component: DetailsInscriptionEleveComponent;
  let fixture: ComponentFixture<DetailsInscriptionEleveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailsInscriptionEleveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsInscriptionEleveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
