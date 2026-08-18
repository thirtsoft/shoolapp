import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassesAAjouterComponent } from './classes-a-ajouter-component';

describe('ClassesAAjouterComponent', () => {
  let component: ClassesAAjouterComponent;
  let fixture: ComponentFixture<ClassesAAjouterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassesAAjouterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ClassesAAjouterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
