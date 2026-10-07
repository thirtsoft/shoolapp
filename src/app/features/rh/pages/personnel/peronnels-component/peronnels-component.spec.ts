import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeronnelsComponent } from './peronnels-component';

describe('PeronnelsComponent', () => {
  let component: PeronnelsComponent;
  let fixture: ComponentFixture<PeronnelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeronnelsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PeronnelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
