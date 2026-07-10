import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditTypeDepenseComponent } from './create-edit-type-depense-component';

describe('CreateEditTypeDepenseComponent', () => {
  let component: CreateEditTypeDepenseComponent;
  let fixture: ComponentFixture<CreateEditTypeDepenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateEditTypeDepenseComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateEditTypeDepenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
