import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListReunionComponent } from './list-reunion.component';

describe('ListReunionComponent', () => {
  let component: ListReunionComponent;
  let fixture: ComponentFixture<ListReunionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListReunionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListReunionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
