import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeBulletinEleveComponent } from './liste-bulletin-eleve.component';

describe('ListeBulletinEleveComponent', () => {
  let component: ListeBulletinEleveComponent;
  let fixture: ComponentFixture<ListeBulletinEleveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListeBulletinEleveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListeBulletinEleveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
