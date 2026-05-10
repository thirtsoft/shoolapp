import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideBarParentComponent } from './side-bar-parent-component';

describe('SideBarParentComponent', () => {
  let component: SideBarParentComponent;
  let fixture: ComponentFixture<SideBarParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideBarParentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SideBarParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
