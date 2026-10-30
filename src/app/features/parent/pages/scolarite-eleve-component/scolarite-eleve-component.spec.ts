import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScolariteEleveComponent } from './scolarite-eleve-component';

describe('ScolariteEleveComponent', () => {
  let component: ScolariteEleveComponent;
  let fixture: ComponentFixture<ScolariteEleveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScolariteEleveComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ScolariteEleveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
