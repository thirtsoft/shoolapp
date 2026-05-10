import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericTableDossierComponent } from './generic-table-dossier.component';

describe('GenericTableDossierComponent', () => {
  let component: GenericTableDossierComponent;
  let fixture: ComponentFixture<GenericTableDossierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenericTableDossierComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericTableDossierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
