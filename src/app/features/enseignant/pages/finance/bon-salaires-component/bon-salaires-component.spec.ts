import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BonSalairesComponent } from './bon-salaires-component';

describe('BonSalairesComponent', () => {
  let component: BonSalairesComponent;
  let fixture: ComponentFixture<BonSalairesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BonSalairesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BonSalairesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
