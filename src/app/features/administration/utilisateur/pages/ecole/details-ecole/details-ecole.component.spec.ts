import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsEcoleComponent } from './details-ecole.component';

describe('DetailsEcoleComponent', () => {
  let component: DetailsEcoleComponent;
  let fixture: ComponentFixture<DetailsEcoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailsEcoleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsEcoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
