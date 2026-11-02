import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditBanqueComponent } from './create-edit-banque-component';

describe('CreateEditBanqueComponent', () => {
  let component: CreateEditBanqueComponent;
  let fixture: ComponentFixture<CreateEditBanqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateEditBanqueComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateEditBanqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
