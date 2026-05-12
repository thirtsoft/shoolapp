import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListInscriptionEleveParentComponent } from './list-inscription-eleve-parent.component';

describe('ListInscriptionEleveParentComponent', () => {
  let component: ListInscriptionEleveParentComponent;
  let fixture: ComponentFixture<ListInscriptionEleveParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListInscriptionEleveParentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListInscriptionEleveParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
