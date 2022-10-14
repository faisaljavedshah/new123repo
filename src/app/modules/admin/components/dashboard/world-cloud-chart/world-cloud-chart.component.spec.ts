import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorldCloudChartComponent } from './world-cloud-chart.component';

describe('WorldCloudChartComponent', () => {
  let component: WorldCloudChartComponent;
  let fixture: ComponentFixture<WorldCloudChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorldCloudChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorldCloudChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
