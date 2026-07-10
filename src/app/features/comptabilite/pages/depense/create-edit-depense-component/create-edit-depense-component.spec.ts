import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditDepenseComponent } from './create-edit-depense-component';

describe('CreateEditDepenseComponent', () => {
  let component: CreateEditDepenseComponent;
  let fixture: ComponentFixture<CreateEditDepenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateEditDepenseComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateEditDepenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
