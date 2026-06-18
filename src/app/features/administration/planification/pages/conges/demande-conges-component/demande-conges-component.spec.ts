import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandeCongesComponent } from './demande-conges-component';

describe('DemandeCongesComponent', () => {
  let component: DemandeCongesComponent;
  let fixture: ComponentFixture<DemandeCongesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandeCongesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DemandeCongesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
