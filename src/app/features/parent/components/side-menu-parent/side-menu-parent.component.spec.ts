import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideMenuParentComponent } from './side-menu-parent.component';

describe('SideMenuParentComponent', () => {
  let component: SideMenuParentComponent;
  let fixture: ComponentFixture<SideMenuParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SideMenuParentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SideMenuParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
