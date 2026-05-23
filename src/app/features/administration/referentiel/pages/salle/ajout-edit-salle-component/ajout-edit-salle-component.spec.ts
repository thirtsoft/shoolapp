import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjoutEditSalleComponent } from './ajout-edit-salle-component';

describe('AjoutEditSalleComponent', () => {
  let component: AjoutEditSalleComponent;
  let fixture: ComponentFixture<AjoutEditSalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AjoutEditSalleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AjoutEditSalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
