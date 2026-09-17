import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificationEleveComponent } from './modification-eleve-component';

describe('ModificationEleveComponent', () => {
  let component: ModificationEleveComponent;
  let fixture: ComponentFixture<ModificationEleveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModificationEleveComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModificationEleveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
