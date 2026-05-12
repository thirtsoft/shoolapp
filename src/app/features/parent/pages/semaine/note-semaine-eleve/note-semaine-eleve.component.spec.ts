import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteSemaineEleveComponent } from './note-semaine-eleve.component';

describe('NoteSemaineEleveComponent', () => {
  let component: NoteSemaineEleveComponent;
  let fixture: ComponentFixture<NoteSemaineEleveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoteSemaineEleveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoteSemaineEleveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
