import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangerPasswordUtilisateurComponent } from './changer-password-utilisateur-component';

describe('ChangerPasswordUtilisateurComponent', () => {
  let component: ChangerPasswordUtilisateurComponent;
  let fixture: ComponentFixture<ChangerPasswordUtilisateurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangerPasswordUtilisateurComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangerPasswordUtilisateurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
