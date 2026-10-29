import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListServiceOffertComponent } from './list-service-offert-component';

describe('ListServiceOffertComponent', () => {
  let component: ListServiceOffertComponent;
  let fixture: ComponentFixture<ListServiceOffertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListServiceOffertComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListServiceOffertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
