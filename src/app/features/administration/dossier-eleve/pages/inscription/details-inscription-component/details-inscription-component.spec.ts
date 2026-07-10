import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsInscriptionComponent } from './details-inscription-component';

describe('DetailsInscriptionComponent', () => {
  let component: DetailsInscriptionComponent;
  let fixture: ComponentFixture<DetailsInscriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsInscriptionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsInscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
