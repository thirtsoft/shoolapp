import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenererBulletinComponent } from './generer-bulletin.component';

describe('GenererBulletinComponent', () => {
  let component: GenererBulletinComponent;
  let fixture: ComponentFixture<GenererBulletinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenererBulletinComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenererBulletinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
