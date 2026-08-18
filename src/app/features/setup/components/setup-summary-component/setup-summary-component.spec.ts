import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupSummaryComponent } from './setup-summary-component';

describe('SetupSummaryComponent', () => {
  let component: SetupSummaryComponent;
  let fixture: ComponentFixture<SetupSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetupSummaryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SetupSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
