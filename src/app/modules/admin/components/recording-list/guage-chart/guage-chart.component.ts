import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexChart,
  ApexFill,
  ChartComponent
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
};
@Component({
  selector: 'app-guage-chart',
  templateUrl: './guage-chart.component.html',
  styleUrls: ['./guage-chart.component.scss']
})
export class GuageChartComponent implements OnChanges {
  constructor() {

  }
  @Input() totalScore: any;
  totalscroe:any = 0
  ngOnChanges(changes: SimpleChanges): void {
    if(changes.totalScore.currentValue){
      this.totalscroe = changes.totalScore.currentValue;
      if(this.totalScore){
        this.renderGraph()
      }
    }
  }
  @ViewChild("chart1") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

renderGraph(){
    this.chartOptions = {

      series: [this.totalscroe ? this.totalscroe : 0],
      chart: {
        type: "radialBar",
        offsetY: 0,
      },
      plotOptions: {
        radialBar: {
          hollow : {
            size : '45'
          },
          startAngle: -90,
          endAngle: 90,
          track: {

            background: "#e7e7e7",
            strokeWidth: "97%",
            margin: 5, // margin is in pixels
            dropShadow: {
              enabled: true,
              top: 2,
              left: 0,
              opacity: 0.31,
              blur: 2
            }
          },
          dataLabels: {
            name: {
              show: false
            },
            value: {
              show : false,
              offsetY: -2,
              fontSize: "22px",

            }
          }
        }
      },
      fill: {
        colors : [ this.totalscroe > 49 ?'#66cb9f' : '#FF0000']
      },
      labels: []
    };
  }
}
