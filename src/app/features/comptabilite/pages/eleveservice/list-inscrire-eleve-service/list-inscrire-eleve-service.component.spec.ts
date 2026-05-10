import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListInscrireEleveServiceComponent } from './list-inscrire-eleve-service.component';

describe('ListInscrireEleveServiceComponent', () => {
  let component: ListInscrireEleveServiceComponent;
  let fixture: ComponentFixture<ListInscrireEleveServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListInscrireEleveServiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListInscrireEleveServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
