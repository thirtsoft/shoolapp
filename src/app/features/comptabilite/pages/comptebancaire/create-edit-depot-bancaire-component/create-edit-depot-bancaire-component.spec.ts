import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditDepotBancaireComponent } from './create-edit-depot-bancaire-component';

describe('CreateEditDepotBancaireComponent', () => {
  let component: CreateEditDepotBancaireComponent;
  let fixture: ComponentFixture<CreateEditDepotBancaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateEditDepotBancaireComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateEditDepotBancaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
