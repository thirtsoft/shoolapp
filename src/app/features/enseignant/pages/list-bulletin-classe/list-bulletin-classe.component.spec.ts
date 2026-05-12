import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListBulletinClasseComponent } from './list-bulletin-classe.component';

describe('ListBulletinClasseComponent', () => {
  let component: ListBulletinClasseComponent;
  let fixture: ComponentFixture<ListBulletinClasseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListBulletinClasseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListBulletinClasseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
