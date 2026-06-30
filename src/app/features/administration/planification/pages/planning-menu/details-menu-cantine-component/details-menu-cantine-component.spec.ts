import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsMenuCantineComponent } from './details-menu-cantine-component';

describe('DetailsMenuCantineComponent', () => {
  let component: DetailsMenuCantineComponent;
  let fixture: ComponentFixture<DetailsMenuCantineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsMenuCantineComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsMenuCantineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
