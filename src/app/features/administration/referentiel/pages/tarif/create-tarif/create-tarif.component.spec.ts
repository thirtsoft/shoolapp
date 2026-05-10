import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTarifComponent } from './create-tarif.component';

describe('CreateTarifComponent', () => {
  let component: CreateTarifComponent;
  let fixture: ComponentFixture<CreateTarifComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateTarifComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTarifComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
