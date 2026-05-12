import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideBarProfesseurComponent } from './side-bar-professeur-component';

describe('SideBarProfesseurComponent', () => {
  let component: SideBarProfesseurComponent;
  let fixture: ComponentFixture<SideBarProfesseurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideBarProfesseurComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SideBarProfesseurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
