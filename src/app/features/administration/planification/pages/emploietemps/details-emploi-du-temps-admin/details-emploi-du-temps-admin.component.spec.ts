import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsEmploiDuTempsAdminComponent } from './details-emploi-du-temps-admin.component';

describe('DetailsEmploiDuTempsAdminComponent', () => {
  let component: DetailsEmploiDuTempsAdminComponent;
  let fixture: ComponentFixture<DetailsEmploiDuTempsAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailsEmploiDuTempsAdminComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsEmploiDuTempsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
