import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListNiveauComponent } from './list-niveau.component';

describe('ListNiveauComponent', () => {
  let component: ListNiveauComponent;
  let fixture: ComponentFixture<ListNiveauComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListNiveauComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListNiveauComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
