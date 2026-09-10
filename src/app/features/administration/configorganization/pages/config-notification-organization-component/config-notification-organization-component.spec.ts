import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigNotificationOrganizationComponent } from './config-notification-organization-component';

describe('ConfigNotificationOrganizationComponent', () => {
  let component: ConfigNotificationOrganizationComponent;
  let fixture: ComponentFixture<ConfigNotificationOrganizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigNotificationOrganizationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfigNotificationOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
