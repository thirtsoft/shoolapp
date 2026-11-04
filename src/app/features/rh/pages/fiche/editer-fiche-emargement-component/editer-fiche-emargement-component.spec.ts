import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditerFicheEmargementComponent } from './editer-fiche-emargement-component';

describe('EditerFicheEmargementComponent', () => {
  let component: EditerFicheEmargementComponent;
  let fixture: ComponentFixture<EditerFicheEmargementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditerFicheEmargementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditerFicheEmargementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
