import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesEnseignementComponent } from './mes-enseignement-component';

describe('MesEnseignementComponent', () => {
  let component: MesEnseignementComponent;
  let fixture: ComponentFixture<MesEnseignementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesEnseignementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MesEnseignementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
