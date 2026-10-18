import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsBonSalaireComponent } from './details-bon-salaire-component';

describe('DetailsBonSalaireComponent', () => {
  let component: DetailsBonSalaireComponent;
  let fixture: ComponentFixture<DetailsBonSalaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsBonSalaireComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsBonSalaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
