import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructurePedagogiqueComponent } from './structure-pedagogique-component';

describe('StructurePedagogiqueComponent', () => {
  let component: StructurePedagogiqueComponent;
  let fixture: ComponentFixture<StructurePedagogiqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StructurePedagogiqueComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StructurePedagogiqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
