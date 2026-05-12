import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreationCoursComponent } from './creation-cours.component';

describe('CreationCoursComponent', () => {
  let component: CreationCoursComponent;
  let fixture: ComponentFixture<CreationCoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreationCoursComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreationCoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
