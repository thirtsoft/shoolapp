import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreationInscriptionComponent } from './creation-inscription.component';

describe('CreationInscriptionComponent', () => {
  let component: CreationInscriptionComponent;
  let fixture: ComponentFixture<CreationInscriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreationInscriptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreationInscriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
