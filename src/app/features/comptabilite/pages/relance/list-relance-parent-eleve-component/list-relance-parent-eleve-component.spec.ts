import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListRelanceParentEleveComponent } from './list-relance-parent-eleve-component';

describe('ListRelanceParentEleveComponent', () => {
  let component: ListRelanceParentEleveComponent;
  let fixture: ComponentFixture<ListRelanceParentEleveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListRelanceParentEleveComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListRelanceParentEleveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
