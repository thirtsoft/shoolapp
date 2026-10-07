import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaiesComponent } from './paies-component';

describe('PaiesComponent', () => {
  let component: PaiesComponent;
  let fixture: ComponentFixture<PaiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaiesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
