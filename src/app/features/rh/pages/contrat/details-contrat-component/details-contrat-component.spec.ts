import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsContratComponent } from './details-contrat-component';

describe('DetailsContratComponent', () => {
  let component: DetailsContratComponent;
  let fixture: ComponentFixture<DetailsContratComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsContratComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsContratComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
