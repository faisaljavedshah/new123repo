import {
  Component,
  OnInit,
  Inject,
  NgZone,
  PLATFORM_ID,
  OnChanges,
  Input,
  SimpleChanges
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import * as am4core from '@amcharts/amcharts4/core';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import * as am5 from '@amcharts/amcharts5';
import * as am5wc from '@amcharts/amcharts5/wc';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4plugins_wordCloud from '@amcharts/amcharts4/plugins/wordCloud';
am4core.useTheme(am4themes_animated);

@Component({
  selector: 'app-world-cloud-chart',
  templateUrl: './world-cloud-chart.component.html',
  styleUrls: ['./world-cloud-chart.component.scss']
})
export class WorldCloudChartComponent implements OnInit, OnChanges {
  constructor(@Inject(PLATFORM_ID) private platformId, private zone: NgZone) {}

  world: any;
  @Input() data: any;

  ngOnChanges(changes: SimpleChanges): void {
    this.world = changes.data.currentValue?.keywords;

    if (this.world) {
      this.renderGraph();
    }
  }
  // Run the function only in the browser
  browserOnly(f: () => void) {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }

  renderGraph() {
    this.browserOnly(() => {
      am4core.useTheme(am4themes_animated);
      // Themes end

      var chart = am4core.create('keyWordds', am4plugins_wordCloud.WordCloud);
      var series = chart.series.push(
        new am4plugins_wordCloud.WordCloudSeries()
      );

      series.accuracy = 4;
      series.step = 15;
      series.rotationThreshold = 0.7;
      series.maxCount = 200;
      series.minWordLength = 2;
      series.excludeWords = ['you'];
      series.labels.template.tooltipText = '{word}: {value}';
      series.fontFamily = 'Courier New';
      series.maxFontSize = am4core.percent(30);

      series.heatRules.push({
        target: series.labels.template,
        property: 'fill',
        min: am4core.color('#2999FD'),
        max: am4core.color('#2999FD'),
        dataField: 'value'
      });

      series.text = this.world;
    });
  }
  ngOnInit(): void {}
}
