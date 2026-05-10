import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListEnseignementComponent } from './list-enseignement.component';

describe('ListEnseignementComponent', () => {
  let component: ListEnseignementComponent;
  let fixture: ComponentFixture<ListEnseignementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListEnseignementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListEnseignementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
