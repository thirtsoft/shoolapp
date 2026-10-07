import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessCreationPersonnelComponent } from './success-creation-personnel-component';

describe('SuccessCreationPersonnelComponent', () => {
  let component: SuccessCreationPersonnelComponent;
  let fixture: ComponentFixture<SuccessCreationPersonnelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessCreationPersonnelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SuccessCreationPersonnelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
