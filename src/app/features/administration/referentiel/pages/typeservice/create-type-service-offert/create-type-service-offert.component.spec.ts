import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTypeServiceOffertComponent } from './create-type-service-offert.component';

describe('CreateTypeServiceOffertComponent', () => {
  let component: CreateTypeServiceOffertComponent;
  let fixture: ComponentFixture<CreateTypeServiceOffertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateTypeServiceOffertComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTypeServiceOffertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
