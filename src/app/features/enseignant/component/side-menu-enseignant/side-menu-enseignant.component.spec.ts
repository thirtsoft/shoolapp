import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideMenuEnseignantComponent } from './side-menu-enseignant.component';

describe('SideMenuEnseignantComponent', () => {
  let component: SideMenuEnseignantComponent;
  let fixture: ComponentFixture<SideMenuEnseignantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SideMenuEnseignantComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SideMenuEnseignantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
