import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditSerieComponent } from './create-edit-serie-component';

describe('CreateEditSerieComponent', () => {
  let component: CreateEditSerieComponent;
  let fixture: ComponentFixture<CreateEditSerieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateEditSerieComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateEditSerieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
