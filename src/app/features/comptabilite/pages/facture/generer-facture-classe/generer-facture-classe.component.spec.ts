import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenererFactureClasseComponent } from './generer-facture-classe.component';

describe('GenererFactureClasseComponent', () => {
  let component: GenererFactureClasseComponent;
  let fixture: ComponentFixture<GenererFactureClasseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenererFactureClasseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenererFactureClasseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
