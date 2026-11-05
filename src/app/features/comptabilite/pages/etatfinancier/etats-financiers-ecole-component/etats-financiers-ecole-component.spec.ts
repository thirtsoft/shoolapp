import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtatsFinanciersEcoleComponent } from './etats-financiers-ecole-component';

describe('EtatsFinanciersEcoleComponent', () => {
  let component: EtatsFinanciersEcoleComponent;
  let fixture: ComponentFixture<EtatsFinanciersEcoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EtatsFinanciersEcoleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EtatsFinanciersEcoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
