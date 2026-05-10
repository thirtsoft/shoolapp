import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InscrireEleveServiceComponent } from './inscrire-eleve-service.component';

describe('InscrireEleveServiceComponent', () => {
  let component: InscrireEleveServiceComponent;
  let fixture: ComponentFixture<InscrireEleveServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InscrireEleveServiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InscrireEleveServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
