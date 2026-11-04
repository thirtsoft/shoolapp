import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsFicheEmargementComponent } from './details-fiche-emargement-component';

describe('DetailsFicheEmargementComponent', () => {
  let component: DetailsFicheEmargementComponent;
  let fixture: ComponentFixture<DetailsFicheEmargementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsFicheEmargementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsFicheEmargementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
