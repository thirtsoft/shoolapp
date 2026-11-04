import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntresFicheEmargementComponent } from './entres-fiche-emargement-component';

describe('EntresFicheEmargementComponent', () => {
  let component: EntresFicheEmargementComponent;
  let fixture: ComponentFixture<EntresFicheEmargementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntresFicheEmargementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EntresFicheEmargementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
