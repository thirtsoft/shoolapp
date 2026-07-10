import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeInscriptionComponent } from './liste-inscription.component';

describe('ListeInscriptionComponent', () => {
  let component: ListeInscriptionComponent;
  let fixture: ComponentFixture<ListeInscriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListeInscriptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListeInscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
