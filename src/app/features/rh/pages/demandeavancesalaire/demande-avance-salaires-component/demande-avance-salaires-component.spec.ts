import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandeAvanceSalairesComponent } from './demande-avance-salaires-component';

describe('DemandeAvanceSalairesComponent', () => {
  let component: DemandeAvanceSalairesComponent;
  let fixture: ComponentFixture<DemandeAvanceSalairesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandeAvanceSalairesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DemandeAvanceSalairesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
