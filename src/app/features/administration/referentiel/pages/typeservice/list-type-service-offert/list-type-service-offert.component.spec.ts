import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTypeServiceOffertComponent } from './list-type-service-offert.component';

describe('ListTypeServiceOffertComponent', () => {
  let component: ListTypeServiceOffertComponent;
  let fixture: ComponentFixture<ListTypeServiceOffertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListTypeServiceOffertComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListTypeServiceOffertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
