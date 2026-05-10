import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeconsComponent } from './lecons.component';

describe('LeconsComponent', () => {
  let component: LeconsComponent;
  let fixture: ComponentFixture<LeconsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeconsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
