import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeSerieComponent } from './liste-serie-component';

describe('ListeSerieComponent', () => {
  let component: ListeSerieComponent;
  let fixture: ComponentFixture<ListeSerieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeSerieComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListeSerieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
