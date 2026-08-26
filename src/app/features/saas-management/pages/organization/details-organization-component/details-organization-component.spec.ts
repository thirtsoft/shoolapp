import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsOrganizationComponent } from './details-organization-component';

describe('DetailsOrganizationComponent', () => {
  let component: DetailsOrganizationComponent;
  let fixture: ComponentFixture<DetailsOrganizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsOrganizationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
