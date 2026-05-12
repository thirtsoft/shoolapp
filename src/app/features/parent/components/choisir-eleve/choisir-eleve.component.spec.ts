import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoisirEleveComponent } from './choisir-eleve.component';

describe('ChoisirEleveComponent', () => {
  let component: ChoisirEleveComponent;
  let fixture: ComponentFixture<ChoisirEleveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChoisirEleveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChoisirEleveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
