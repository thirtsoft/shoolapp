import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonOrganizationComponent } from './mon-organization-component';

describe('MonOrganizationComponent', () => {
  let component: MonOrganizationComponent;
  let fixture: ComponentFixture<MonOrganizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonOrganizationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MonOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
