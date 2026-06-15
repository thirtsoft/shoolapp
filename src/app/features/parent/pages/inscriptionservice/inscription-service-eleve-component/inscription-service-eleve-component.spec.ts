import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InscriptionServiceEleveComponent } from './inscription-service-eleve-component';

describe('InscriptionServiceEleveComponent', () => {
  let component: InscriptionServiceEleveComponent;
  let fixture: ComponentFixture<InscriptionServiceEleveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InscriptionServiceEleveComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InscriptionServiceEleveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
