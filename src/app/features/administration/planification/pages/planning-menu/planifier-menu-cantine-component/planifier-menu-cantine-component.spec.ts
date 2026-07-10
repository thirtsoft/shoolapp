import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanifierMenuCantineComponent } from './planifier-menu-cantine-component';

describe('PlanifierMenuCantineComponent', () => {
  let component: PlanifierMenuCantineComponent;
  let fixture: ComponentFixture<PlanifierMenuCantineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanifierMenuCantineComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlanifierMenuCantineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
