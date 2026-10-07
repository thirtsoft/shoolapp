import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypePersonnelComponent } from './type-personnel-component';

describe('TypePersonnelComponent', () => {
  let component: TypePersonnelComponent;
  let fixture: ComponentFixture<TypePersonnelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypePersonnelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TypePersonnelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
