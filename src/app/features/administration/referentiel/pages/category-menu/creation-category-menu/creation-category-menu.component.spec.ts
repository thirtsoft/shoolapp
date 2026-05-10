import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreationCategoryMenuComponent } from './creation-category-menu.component';

describe('CreationCategoryMenuComponent', () => {
  let component: CreationCategoryMenuComponent;
  let fixture: ComponentFixture<CreationCategoryMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreationCategoryMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreationCategoryMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
