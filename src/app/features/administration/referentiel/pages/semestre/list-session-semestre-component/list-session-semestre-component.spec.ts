import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSessionSemestreComponent } from './list-session-semestre-component';

describe('ListSessionSemestreComponent', () => {
  let component: ListSessionSemestreComponent;
  let fixture: ComponentFixture<ListSessionSemestreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListSessionSemestreComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListSessionSemestreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
