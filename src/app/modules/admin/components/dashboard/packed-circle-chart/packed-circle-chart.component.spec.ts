import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackedCircleChartComponent } from './packed-circle-chart.component';

describe('PackedCircleChartComponent', () => {
  let component: PackedCircleChartComponent;
  let fixture: ComponentFixture<PackedCircleChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PackedCircleChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PackedCircleChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
