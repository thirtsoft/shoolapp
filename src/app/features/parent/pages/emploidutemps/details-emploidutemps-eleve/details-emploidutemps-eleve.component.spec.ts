import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsEmploidutempsEleveComponent } from './details-emploidutemps-eleve.component';

describe('DetailsEmploidutempsEleveComponent', () => {
  let component: DetailsEmploidutempsEleveComponent;
  let fixture: ComponentFixture<DetailsEmploidutempsEleveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailsEmploidutempsEleveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsEmploidutempsEleveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
