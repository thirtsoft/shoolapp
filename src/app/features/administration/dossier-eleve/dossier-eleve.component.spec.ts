import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DossierEleveComponent } from './dossier-eleve.component';

describe('DossierEleveComponent', () => {
  let component: DossierEleveComponent;
  let fixture: ComponentFixture<DossierEleveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DossierEleveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DossierEleveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
