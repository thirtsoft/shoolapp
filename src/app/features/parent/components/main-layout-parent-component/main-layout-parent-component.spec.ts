import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainLayoutParentComponent } from './main-layout-parent-component';

describe('MainLayoutParentComponent', () => {
  let component: MainLayoutParentComponent;
  let fixture: ComponentFixture<MainLayoutParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayoutParentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
