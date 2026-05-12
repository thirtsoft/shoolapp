import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListFactureEleveComponent } from './list-facture-eleve.component';

describe('ListFactureEleveComponent', () => {
  let component: ListFactureEleveComponent;
  let fixture: ComponentFixture<ListFactureEleveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListFactureEleveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListFactureEleveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
