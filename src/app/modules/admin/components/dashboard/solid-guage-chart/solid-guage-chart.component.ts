import {
  Component,
  OnInit,
  Inject,
  NgZone,
  PLATFORM_ID,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import * as am5radar from '@amcharts/amcharts5/radar';

@Component({
  selector: 'app-solid-guage-chart',
  templateUrl: './solid-guage-chart.component.html',
  styleUrls: ['./solid-guage-chart.component.scss']
})
export class SolidGuageChartComponent implements OnChanges {
  constructor(@Inject(PLATFORM_ID) private platformId, private zone: NgZone) {}
  analysis: any;
  @Input() data: any;

  ngOnChanges(changes: SimpleChanges): void {
    this.analysis = changes.data.currentValue?.call_analysis;

    if (this.analysis) {
      this.renderGraph();
    }
  }

  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }

  renderGraph() {
    this.browserOnly(() => {
      let root = am5.Root.new('callAnalysis');
      root.setThemes([am5themes_Animated.new(root)]);

      let chart = root.container.children.push(
        am5radar.RadarChart.new(root, {
          innerRadius: am5.percent(20),
          startAngle: -90,
          endAngle: 180
        })
      );

      // Data
      let data = [
        {
          category: 'Missed opportunities',
          value: this.analysis.missed_opportunity,
          full: this.analysis.total_calls,
          columnSettings: {
            fill: am5.color('#24D4D3')
          }
        },
        {
          category: 'Leads',
          value: this.analysis.leads,
          full: this.analysis.total_calls,
          columnSettings: {
            fill: am5.color('#F5EB8E')
          }
        },
        {
          category: 'Total calls',
          value: this.analysis.total_calls,
          full: this.analysis.total_calls,
          columnSettings: {
            fill: am5.color('#7CB5EC')
          }
        }
      ];

      // Add cursor
      // https://www.amcharts.com/docs/v5/charts/radar-chart/#Cursor
      let cursor = chart.set(
        'cursor',
        am5radar.RadarCursor.new(root, {
          behavior: 'zoomX'
        })
      );

      cursor.lineY.set('visible', false);

      // Create axes and their renderers
      // https://www.amcharts.com/docs/v5/charts/radar-chart/#Adding_axes
      let xRenderer = am5radar.AxisRendererCircular.new(root, {
        minGridDistance: 50
      });

      let xAxis = chart.xAxes.push(
        am5xy.ValueAxis.new(root, {
          renderer: xRenderer,
          min: 0,
          max: this.analysis.total_calls,
          strictMinMax: true,
          // numberFormat: "#'%'",
          tooltip: am5.Tooltip.new(root, {})
        })
      );

      let yRenderer = am5radar.AxisRendererRadial.new(root, {
        minGridDistance: 20
      });

      yRenderer.labels.template.setAll({
        centerX: am5.p100,
        fontWeight: '400',
        fontSize: 14
        // templateField: 'columnSettings',
      });

      yRenderer.grid.template.setAll({
        forceHidden: true
      });

      let yAxis = chart.yAxes.push(
        am5xy.CategoryAxis.new(root, {
          categoryField: 'category',
          renderer: yRenderer
        })
      );

      yAxis.data.setAll(data);

      // Create series
      // https://www.amcharts.com/docs/v5/charts/radar-chart/#Adding_series
      let series1 = chart.series.push(
        am5radar.RadarColumnSeries.new(root, {
          xAxis: xAxis,
          yAxis: yAxis,
          clustered: false,
          valueXField: 'full',
          categoryYField: 'category',
          fill: root.interfaceColors.get('alternativeBackground')
        })
      );

      series1.columns.template.setAll({
        width: am5.p100,
        fillOpacity: 0.08,
        strokeOpacity: 0,
        cornerRadius: 10
      });

      series1.data.setAll(data);

      let series2 = chart.series.push(
        am5radar.RadarColumnSeries.new(root, {
          xAxis: xAxis,
          yAxis: yAxis,
          clustered: false,
          valueXField: 'value',
          categoryYField: 'category'
        })
      );

      series2.columns.template.setAll({
        width: am5.p100,
        strokeOpacity: 0,
        tooltipText: '{category}: {valueX}',
        cornerRadius: 20,
        templateField: 'columnSettings'
      });

      series2.data.setAll(data);

      // Animate chart and series in
      // https://www.amcharts.com/docs/v5/concepts/animations/#Initial_animation
      series1.appear(1000);
      series2.appear(1000);
      chart.appear(1000, 100);
    });
  }
}
