import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangerPasswordParentComponent } from './changer-password-parent.component';

describe('ChangerPasswordParentComponent', () => {
  let component: ChangerPasswordParentComponent;
  let fixture: ComponentFixture<ChangerPasswordParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangerPasswordParentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangerPasswordParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
