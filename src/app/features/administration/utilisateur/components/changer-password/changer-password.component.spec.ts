import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangerPasswordComponent } from './changer-password.component';

describe('ChangerPasswordComponent', () => {
  let component: ChangerPasswordComponent;
  let fixture: ComponentFixture<ChangerPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangerPasswordComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangerPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
