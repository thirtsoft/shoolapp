import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesPaiesComponent } from './mes-paies-component';

describe('MesPaiesComponent', () => {
  let component: MesPaiesComponent;
  let fixture: ComponentFixture<MesPaiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesPaiesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MesPaiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
