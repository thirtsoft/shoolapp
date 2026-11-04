import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesFichesEmargementsComponent } from './mes-fiches-emargements-component';

describe('MesFichesEmargementsComponent', () => {
  let component: MesFichesEmargementsComponent;
  let fixture: ComponentFixture<MesFichesEmargementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesFichesEmargementsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MesFichesEmargementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
