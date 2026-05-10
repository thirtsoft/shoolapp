import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateModePaiementComponent } from './create-mode-paiement.component';

describe('CreateModePaiementComponent', () => {
  let component: CreateModePaiementComponent;
  let fixture: ComponentFixture<CreateModePaiementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateModePaiementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateModePaiementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
