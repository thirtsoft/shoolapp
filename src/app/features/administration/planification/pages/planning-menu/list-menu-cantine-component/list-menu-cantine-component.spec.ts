import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMenuCantineComponent } from './list-menu-cantine-component';

describe('ListMenuCantineComponent', () => {
  let component: ListMenuCantineComponent;
  let fixture: ComponentFixture<ListMenuCantineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListMenuCantineComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListMenuCantineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
