import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreationEleveComponent } from './creation-eleve.component';

describe('CreationEleveComponent', () => {
  let component: CreationEleveComponent;
  let fixture: ComponentFixture<CreationEleveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreationEleveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreationEleveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
