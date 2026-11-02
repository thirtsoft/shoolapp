import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditCompteBancaireComponent } from './create-edit-compte-bancaire-component';

describe('CreateEditCompteBancaireComponent', () => {
  let component: CreateEditCompteBancaireComponent;
  let fixture: ComponentFixture<CreateEditCompteBancaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateEditCompteBancaireComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateEditCompteBancaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
