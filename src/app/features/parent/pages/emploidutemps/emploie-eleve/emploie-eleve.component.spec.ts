import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmploieEleveComponent } from './emploie-eleve.component';

describe('EmploieEleveComponent', () => {
  let component: EmploieEleveComponent;
  let fixture: ComponentFixture<EmploieEleveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmploieEleveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmploieEleveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
