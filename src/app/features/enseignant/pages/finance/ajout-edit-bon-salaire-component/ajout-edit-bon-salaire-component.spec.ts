import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjoutEditBonSalaireComponent } from './ajout-edit-bon-salaire-component';

describe('AjoutEditBonSalaireComponent', () => {
  let component: AjoutEditBonSalaireComponent;
  let fixture: ComponentFixture<AjoutEditBonSalaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AjoutEditBonSalaireComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AjoutEditBonSalaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
