import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardParentComponent } from './dashboard-parent.component';

describe('DashboardParentComponent', () => {
  let component: DashboardParentComponent;
  let fixture: ComponentFixture<DashboardParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardParentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
