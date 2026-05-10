import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreationPaiementComponent } from './creation-paiement.component';

describe('CreationPaiementComponent', () => {
  let component: CreationPaiementComponent;
  let fixture: ComponentFixture<CreationPaiementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreationPaiementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreationPaiementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
