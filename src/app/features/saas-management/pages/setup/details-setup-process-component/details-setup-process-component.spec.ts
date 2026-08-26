import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsSetupProcessComponent } from './details-setup-process-component';

describe('DetailsSetupProcessComponent', () => {
  let component: DetailsSetupProcessComponent;
  let fixture: ComponentFixture<DetailsSetupProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsSetupProcessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsSetupProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
