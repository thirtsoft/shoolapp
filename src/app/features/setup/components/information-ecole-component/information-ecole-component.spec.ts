import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformationEcoleComponent } from './information-ecole-component';

describe('InformationEcoleComponent', () => {
  let component: InformationEcoleComponent;
  let fixture: ComponentFixture<InformationEcoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InformationEcoleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InformationEcoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
