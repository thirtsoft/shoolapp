import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCongesComponent } from './list-conges-component';

describe('ListCongesComponent', () => {
  let component: ListCongesComponent;
  let fixture: ComponentFixture<ListCongesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListCongesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListCongesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
