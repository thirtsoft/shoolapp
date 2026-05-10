import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeModePaiementComponent } from './liste-mode-paiement.component';

describe('ListeModePaiementComponent', () => {
  let component: ListeModePaiementComponent;
  let fixture: ComponentFixture<ListeModePaiementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListeModePaiementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListeModePaiementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
