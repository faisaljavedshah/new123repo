import {
  Component,
  Inject,
  Input,
  NgZone,
  OnChanges,
  OnInit,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';

@Component({
  selector: 'app-polar-area',
  templateUrl: './polar-area.component.html',
  styleUrls: ['./polar-area.component.scss']
})
export class PolarAreaComponent implements OnChanges {
  constructor(@Inject(PLATFORM_ID) private platformId, private zone: NgZone) {}

  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }
  polorArea: any;
  @Input() polor: any;
  ngOnChanges(changes: SimpleChanges): void {
    this.polorArea = changes.polor?.currentValue;
    // console.log('=============>', this.polorArea);
    this.renderGraph();
  }

  renderGraph() {
    this.browserOnly(() => {
      let chart = am4core.create('polor', am4charts.RadarChart);
      chart.data = this.polorArea;
      chart.seriesContainer.zIndex = -1;
      chart.colors.saturation = 0.5;
      chart.colors.list = [
        am4core.color('#6EE9E8'),
        am4core.color('#C4C6F5'),
        am4core.color('#D5D1D1'),
        am4core.color('#8ABFF3'),
        am4core.color('#7DDDDB'),
        am4core.color('#F5CBA7'),
        am4core.color('#C6DEF5'),
        am4core.color('#ED9A9A'),
        am4core.color('#B1B4F0'),
        am4core.color('#F4CDF5'),
        am4core.color('#C4C2C2'),
        am4core.color('#AAD0F4'),
        am4core.color('#F6C49A'),
        am4core.color('#75BFBE'),
        am4core.color('#9E9EA0'),
        am4core.color('#F4CDF5'),
        am4core.color('#EC7E7E'),
        am4core.color('#F2B785'),
        am4core.color('#63AAA9'),
        am4core.color('#ADA8A8'),
        am4core.color('#C6DEF5'),
        am4core.color('#8ABFF3'),
        am4core.color('#C4C6F5')
      ];

      var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis() as any);
      categoryAxis.dataFields.category = 'indicator';
      categoryAxis.renderer.labels.template.location = 0.5;
      categoryAxis.renderer.labels.template.fontSize = 12;
      categoryAxis.renderer.labels.template.fill = '#585556';
      categoryAxis.renderer.labels.template.wrap = true;
      categoryAxis.renderer.labels.template.maxWidth = 90;
      var valueAxis = chart.yAxes.push(new am4charts.ValueAxis() as any);
      valueAxis.tooltip.disabled = false;
      valueAxis.renderer.labels.template.fontSize = 16;
      valueAxis.renderer.labels.template.fill = am4core.color('#707070');

      var series1 = chart.series.push(new am4charts.RadarColumnSeries());
      series1.columns.template.width = am4core.percent(100);
      series1.columns.template.strokeOpacity = 0;
      series1.columns.template.radarColumn.cornerRadius = 1;
      series1.columns.template.radarColumn.innerCornerRadius = 0;
      series1.tooltip.getFillFromObject = false;
      let BgColor = '#FFFFFF';
      let ToolTipTextColor = '#425466';
      series1.tooltip.getFillFromObject = false;
      series1.tooltip.background.fill = am4core.color(BgColor);
      series1.tooltip.label.fill = am4core.color(ToolTipTextColor);
      series1.columns.template.tooltipHTML = `
      <strong > {indicator} </strong>
      <hr />
      {percent} of calls marked with <br/> all of {indicator} <br/> indicators
      <br/><p style="color='green'">{valueY.value} of {total}</p>
      `;
      series1.dataFields.categoryX = 'indicator';
      series1.dataFields.valueY = 'value';

      series1.columns.template.adapter.add('fill', (fill, target) => {
        return chart.colors.getIndex(target.dataItem.index);
      });
    });
  }
}
