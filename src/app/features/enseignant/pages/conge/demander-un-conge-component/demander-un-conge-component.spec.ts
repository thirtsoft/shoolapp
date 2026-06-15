import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemanderUnCongeComponent } from './demander-un-conge-component';

describe('DemanderUnCongeComponent', () => {
  let component: DemanderUnCongeComponent;
  let fixture: ComponentFixture<DemanderUnCongeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemanderUnCongeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DemanderUnCongeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
