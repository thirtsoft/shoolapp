import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsCongesComponent } from './details-conges-component';

describe('DetailsCongesComponent', () => {
  let component: DetailsCongesComponent;
  let fixture: ComponentFixture<DetailsCongesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsCongesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsCongesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
