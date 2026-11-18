import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsActiviteComponent } from './details-activite.component';

describe('DetailsActiviteComponent', () => {
  let component: DetailsActiviteComponent;
  let fixture: ComponentFixture<DetailsActiviteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsActiviteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsActiviteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
