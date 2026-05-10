import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreationBatimentComponent } from './creation-batiment.component';

describe('CreationBatimentComponent', () => {
  let component: CreationBatimentComponent;
  let fixture: ComponentFixture<CreationBatimentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreationBatimentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreationBatimentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
