import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FichesEmargementComponent } from './fiches-emargement-component';

describe('FichesEmargementComponent', () => {
  let component: FichesEmargementComponent;
  let fixture: ComponentFixture<FichesEmargementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FichesEmargementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FichesEmargementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
