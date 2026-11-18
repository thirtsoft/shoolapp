import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjoutEditActiviteScolaireComponent } from './ajout-edit-activite-scolaire.component';

describe('AjoutEditActiviteScolaireComponent', () => {
  let component: AjoutEditActiviteScolaireComponent;
  let fixture: ComponentFixture<AjoutEditActiviteScolaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AjoutEditActiviteScolaireComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AjoutEditActiviteScolaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
