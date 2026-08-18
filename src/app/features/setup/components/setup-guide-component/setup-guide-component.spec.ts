import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupGuideComponent } from './setup-guide-component';

describe('SetupGuideComponent', () => {
  let component: SetupGuideComponent;
  let fixture: ComponentFixture<SetupGuideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetupGuideComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SetupGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
