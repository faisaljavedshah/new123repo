import {
  Component,
  OnInit,
  Inject,
  NgZone,
  PLATFORM_ID,
  Input,
  SimpleChanges,
  OnChanges
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import * as am4plugins_wordCloud from '@amcharts/amcharts4/plugins/wordCloud';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';

// am4core.useTheme(am4themes_animated);

@Component({
  selector: 'app-sankey-diagrame',
  templateUrl: './sankey-diagrame.component.html',
  styleUrls: ['./sankey-diagrame.component.scss']
})
export class SankeyDiagrameComponent implements OnInit, OnChanges {
  constructor(@Inject(PLATFORM_ID) private platformId, private zone: NgZone) {}

  sankeyData: any;
  @Input() sankey: any;

  ngOnChanges(changes: SimpleChanges): void {
    this.sankeyData = changes.sankey.currentValue?.industries;
    console.log('data------>', this.sankeyData);

    if (this.sankeyData) {
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
      am4core.unuseTheme(am4themes_animated);

      let chart = am4core.create('sankey', am4charts.SankeyDiagram);
      chart.nodes.template.propertyFields.hidden = 'disabled';

      chart.dataFields.fromName = 'from';
      chart.dataFields.toName = 'to';
      chart.dataFields.value = 'value';

      chart.dataFields.visible = 'from_name';
      chart.dataFields.visible = 'to_name';
      chart.dataFields.visible = 'to_count';
      chart.dataFields.visible = 'from_count';
      chart.dataFields.visible = 'total';
      chart.dataFields.visible = 'to_total_per';
      chart.dataFields.visible = 'new_value';

      chart.fontSize = 12;
      chart.paddingRight = 200;
      chart.paddingTop = 10;
      chart.marginBottom = 10;
      chart.data = this.sankeyData;
      let BgColor = '#FFFFFF';
      let ToolTipTextColor = '#425466';
      chart.height = 400;
      chart.tooltip.getFillFromObject = false;
      chart.tooltip.background.fill = am4core.color(BgColor);
      chart.tooltip.label.fill = am4core.color(ToolTipTextColor);
      chart.tooltip.label.fontSize = 14;
      chart.links.template.tooltipHTML = `
      <strong > {to_name} </strong>
      <hr />
      <strong>{value}% of {from_name}</strong>
      <p> {to_count} of {from_count}</p>
      <hr />
      <strong>{to_total_per}% of overall calls</strong>
      <p>{to_count} of {total}</p>
      `;

      let nodeTemplate = chart.nodes.template;
      chart.colors.saturation = 0.5;
      nodeTemplate.clickable = false;
      nodeTemplate.draggable = false;
      nodeTemplate.cloneTooltip = false;
      nodeTemplate.tooltipHTML = `
      <strong> {from_name} </strong>
      <hr />
      <strong>{from_total_per}% of overall calls</strong>
      <p>{from_count} of {total}</p>
      <hr />
      <strong>Contains:</strong>
      <p>{new_value}</p>
      `;
      nodeTemplate.propertyFields.width = 'width';
      nodeTemplate.height = 5;
      nodeTemplate.marginBottom = 10;
      nodeTemplate.nameLabel.label.fill = am4core.color('#585556');
      nodeTemplate.nameLabel.label.width = 300;
    });
  }

  ngOnInit(): void {}
}
