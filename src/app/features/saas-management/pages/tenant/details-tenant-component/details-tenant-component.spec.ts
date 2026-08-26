import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsTenantComponent } from './details-tenant-component';

describe('DetailsTenantComponent', () => {
  let component: DetailsTenantComponent;
  let fixture: ComponentFixture<DetailsTenantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsTenantComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsTenantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
