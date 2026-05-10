import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLeconComponent } from './create-lecon.component';

describe('CreateLeconComponent', () => {
  let component: CreateLeconComponent;
  let fixture: ComponentFixture<CreateLeconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateLeconComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateLeconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
