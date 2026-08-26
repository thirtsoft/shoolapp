import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSetupProcessComponent } from './list-setup-process-component';

describe('ListSetupProcessComponent', () => {
  let component: ListSetupProcessComponent;
  let fixture: ComponentFixture<ListSetupProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListSetupProcessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListSetupProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
