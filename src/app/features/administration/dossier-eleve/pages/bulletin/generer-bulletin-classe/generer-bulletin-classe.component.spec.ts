import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenererBulletinClasseComponent } from './generer-bulletin-classe.component';

describe('GenererBulletinClasseComponent', () => {
  let component: GenererBulletinClasseComponent;
  let fixture: ComponentFixture<GenererBulletinClasseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenererBulletinClasseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenererBulletinClasseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
