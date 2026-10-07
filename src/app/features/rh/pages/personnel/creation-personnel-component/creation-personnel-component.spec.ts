import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreationPersonnelComponent } from './creation-personnel-component';

describe('CreationPersonnelComponent', () => {
  let component: CreationPersonnelComponent;
  let fixture: ComponentFixture<CreationPersonnelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreationPersonnelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreationPersonnelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
