import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemplirFicheEmargementsComponent } from './remplir-fiche-emargements-component';

describe('RemplirFicheEmargementsComponent', () => {
  let component: RemplirFicheEmargementsComponent;
  let fixture: ComponentFixture<RemplirFicheEmargementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemplirFicheEmargementsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RemplirFicheEmargementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
