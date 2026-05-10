import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmploieDuTempsComponent } from './emploie-du-temps.component';

describe('EmploieDuTempsComponent', () => {
  let component: EmploieDuTempsComponent;
  let fixture: ComponentFixture<EmploieDuTempsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmploieDuTempsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmploieDuTempsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
