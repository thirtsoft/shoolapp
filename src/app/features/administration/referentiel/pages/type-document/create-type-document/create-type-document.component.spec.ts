import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTypeDocumentComponent } from './create-type-document.component';

describe('CreateTypeDocumentComponent', () => {
  let component: CreateTypeDocumentComponent;
  let fixture: ComponentFixture<CreateTypeDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateTypeDocumentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTypeDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
