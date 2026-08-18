import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupHelpComponent } from './setup-help-component';

describe('SetupHelpComponent', () => {
  let component: SetupHelpComponent;
  let fixture: ComponentFixture<SetupHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetupHelpComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SetupHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
