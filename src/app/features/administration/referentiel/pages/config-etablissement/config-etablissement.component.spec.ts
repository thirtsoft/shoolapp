import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigEtablissementComponent } from './config-etablissement.component';

describe('ConfigEtablissementComponent', () => {
  let component: ConfigEtablissementComponent;
  let fixture: ComponentFixture<ConfigEtablissementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigEtablissementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigEtablissementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
