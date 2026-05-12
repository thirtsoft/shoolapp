import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCourseEleveComponent } from './list-course-eleve.component';

describe('ListCourseEleveComponent', () => {
  let component: ListCourseEleveComponent;
  let fixture: ComponentFixture<ListCourseEleveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListCourseEleveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListCourseEleveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
