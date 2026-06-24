import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSessionSemestreComponent } from './create-session-semestre-component';

describe('CreateSessionSemestreComponent', () => {
  let component: CreateSessionSemestreComponent;
  let fixture: ComponentFixture<CreateSessionSemestreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSessionSemestreComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateSessionSemestreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
