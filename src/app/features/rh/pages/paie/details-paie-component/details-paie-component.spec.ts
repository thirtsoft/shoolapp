import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsPaieComponent } from './details-paie-component';

describe('DetailsPaieComponent', () => {
  let component: DetailsPaieComponent;
  let fixture: ComponentFixture<DetailsPaieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsPaieComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsPaieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
