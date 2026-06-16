import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditerSessionSemestreComponent } from './editer-session-semestre-component';

describe('EditerSessionSemestreComponent', () => {
  let component: EditerSessionSemestreComponent;
  let fixture: ComponentFixture<EditerSessionSemestreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditerSessionSemestreComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditerSessionSemestreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
