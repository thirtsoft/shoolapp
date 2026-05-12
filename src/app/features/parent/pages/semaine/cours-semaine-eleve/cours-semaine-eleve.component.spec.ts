import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursSemaineEleveComponent } from './cours-semaine-eleve.component';

describe('CoursSemaineEleveComponent', () => {
  let component: CoursSemaineEleveComponent;
  let fixture: ComponentFixture<CoursSemaineEleveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoursSemaineEleveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoursSemaineEleveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
