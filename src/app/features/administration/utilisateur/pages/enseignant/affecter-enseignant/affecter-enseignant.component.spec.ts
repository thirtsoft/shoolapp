import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AffecterEnseignantComponent } from './affecter-enseignant.component';

describe('AffecterEnseignantComponent', () => {
  let component: AffecterEnseignantComponent;
  let fixture: ComponentFixture<AffecterEnseignantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AffecterEnseignantComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AffecterEnseignantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
