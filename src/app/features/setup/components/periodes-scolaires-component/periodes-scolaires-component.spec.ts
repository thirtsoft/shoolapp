import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodesScolairesComponent } from './periodes-scolaires-component';

describe('PeriodesScolairesComponent', () => {
  let component: PeriodesScolairesComponent;
  let fixture: ComponentFixture<PeriodesScolairesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeriodesScolairesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PeriodesScolairesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
