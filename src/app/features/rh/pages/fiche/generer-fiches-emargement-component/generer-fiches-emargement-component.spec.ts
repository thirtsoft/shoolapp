import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenererFichesEmargementComponent } from './generer-fiches-emargement-component';

describe('GenererFichesEmargementComponent', () => {
  let component: GenererFichesEmargementComponent;
  let fixture: ComponentFixture<GenererFichesEmargementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenererFichesEmargementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GenererFichesEmargementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
