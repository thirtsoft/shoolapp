import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListEleveClasseComponent } from './list-eleve-classe.component';

describe('ListEleveClasseComponent', () => {
  let component: ListEleveClasseComponent;
  let fixture: ComponentFixture<ListEleveClasseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListEleveClasseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListEleveClasseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
