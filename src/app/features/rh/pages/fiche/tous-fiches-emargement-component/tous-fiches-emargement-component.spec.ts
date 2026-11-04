import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TousFichesEmargementComponent } from './tous-fiches-emargement-component';

describe('TousFichesEmargementComponent', () => {
  let component: TousFichesEmargementComponent;
  let fixture: ComponentFixture<TousFichesEmargementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TousFichesEmargementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TousFichesEmargementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
