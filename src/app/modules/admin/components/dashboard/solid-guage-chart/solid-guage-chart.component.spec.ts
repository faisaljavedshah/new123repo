import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolidGuageChartComponent } from './solid-guage-chart.component';

describe('SolidGuageChartComponent', () => {
  let component: SolidGuageChartComponent;
  let fixture: ComponentFixture<SolidGuageChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SolidGuageChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SolidGuageChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
