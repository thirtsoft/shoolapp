import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsFactureParentComponent } from './details-facture-parent.component';

describe('DetailsFactureParentComponent', () => {
  let component: DetailsFactureParentComponent;
  let fixture: ComponentFixture<DetailsFactureParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailsFactureParentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsFactureParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
