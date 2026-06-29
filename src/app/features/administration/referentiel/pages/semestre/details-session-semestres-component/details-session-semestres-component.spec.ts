import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsSessionSemestresComponent } from './details-session-semestres-component';

describe('DetailsSessionSemestresComponent', () => {
  let component: DetailsSessionSemestresComponent;
  let fixture: ComponentFixture<DetailsSessionSemestresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsSessionSemestresComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsSessionSemestresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
