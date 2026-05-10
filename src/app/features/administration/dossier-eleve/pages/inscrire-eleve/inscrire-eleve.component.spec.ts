import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InscrireEleveComponent } from './inscrire-eleve.component';

describe('InscrireEleveComponent', () => {
  let component: InscrireEleveComponent;
  let fixture: ComponentFixture<InscrireEleveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InscrireEleveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InscrireEleveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
