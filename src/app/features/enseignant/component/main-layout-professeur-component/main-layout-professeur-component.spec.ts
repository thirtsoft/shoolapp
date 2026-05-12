import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainLayoutProfesseurComponent } from './main-layout-professeur-component';

describe('MainLayoutProfesseurComponent', () => {
  let component: MainLayoutProfesseurComponent;
  let fixture: ComponentFixture<MainLayoutProfesseurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayoutProfesseurComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutProfesseurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
