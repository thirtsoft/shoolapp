import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificationInfoPersonnelComponent } from './modification-info-personnel-component';

describe('ModificationInfoPersonnelComponent', () => {
  let component: ModificationInfoPersonnelComponent;
  let fixture: ComponentFixture<ModificationInfoPersonnelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModificationInfoPersonnelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModificationInfoPersonnelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
