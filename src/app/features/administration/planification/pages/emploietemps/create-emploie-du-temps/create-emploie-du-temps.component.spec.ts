import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEmploieDuTempsComponent } from './create-emploie-du-temps.component';

describe('CreateEmploieDuTempsComponent', () => {
  let component: CreateEmploieDuTempsComponent;
  let fixture: ComponentFixture<CreateEmploieDuTempsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateEmploieDuTempsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEmploieDuTempsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
