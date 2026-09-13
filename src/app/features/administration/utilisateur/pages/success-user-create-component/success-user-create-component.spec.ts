import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessUserCreateComponent } from './success-user-create-component';

describe('SuccessUserCreateComponent', () => {
  let component: SuccessUserCreateComponent;
  let fixture: ComponentFixture<SuccessUserCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessUserCreateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SuccessUserCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
