import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatieresPrepareesComponent } from './matieres-preparees-component';

describe('MatieresPrepareesComponent', () => {
  let component: MatieresPrepareesComponent;
  let fixture: ComponentFixture<MatieresPrepareesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatieresPrepareesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MatieresPrepareesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
