import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { Injectable } from '@angular/core';
import * as d3 from 'd3';
@Injectable()
@Component({
  selector: 'app-packed-circle-chart',
  templateUrl: './packed-circle-chart.component.html',
  styleUrls: ['./packed-circle-chart.component.scss']
})
export class PackedCircleChartComponent implements OnInit, OnChanges {
  ngOnInit(): void {
  }
  classification: any;
  abc: any;
  abcd: any;
  a = [];
  @Input() data: any;
  ngOnChanges(changes: SimpleChanges): void {
    this.classification = changes.data.currentValue?.classifications;

    let keys = Object.keys(this.classification);
    keys.map((d, index) => {
      this.a.push({ Name: d, Count: this.classification[d] });
    });
    if (this.classification) {
      this.abc = Object.keys(this.classification);
      this.abcd = Object.values(this.classification);
    }
    this.renderChart();
  }

  dataset = {
    children: [
      {
        name: 'ABC',
        children: this.a
      }
    ]
  };
  renderChart() {
    let diameter = 600;
    let height = 480;
    let width = 1000;
    let width2 = 200;
    let color = d3
      .scaleOrdinal<string>()
      .domain([
        'Opportunity',
        'More information',
        'Rescheduling',
        'Internal Call',
        'Vendor/Solicitor',

        'Cancellation',
        'Reached a voicemail prompt but no message left',
        'Caller Hung up',
        'No Answer or Busy',

        'Robo dial',
        'Personal Call',
        'Wrong Number',
        'No Response to IVR',
        'Other'
      ])
      .range([
        '#CBF5C4',
        '#CBF5C4',
        '#CBF5C4',
        '#CBF5C4',
        '#CBF5C4',

        '#FBBFB2',
        '#FBBFB2',
        '#FBBFB2',
        '#FBBFB2',

        '#F5EB8E',
        '#F5EB8E',
        '#F5EB8E',
        '#F5EB8E',
        '#F5EB8E'
      ]);

    let bubble = d3
      .pack()
      .size([width, height])
      .padding(1.5);

    let svg = d3
      .select('#classification')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'bubble');

    let nodes = d3.hierarchy(this.dataset).sum(function(d: any) {
      return d.Count + 50;
    });

    let node = svg
      .selectAll('.node')
      .data(bubble(nodes).descendants())
      .enter()
      .filter(function(d) {
        return !d.children;
      })
      .append('g')
      .attr('class', 'node')
      .attr('transform', function(d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      })
      .style('fill', function(d, i: any) {
        return  color(i);
      });

    node.append('title').text(function(d: any) {
      return d.data.Name + ': ' + '(' + d.data.Count + '%)';
    });

    node
      .append('circle')
      .attr('x', function(d) {
        return d.x;
      })
      .attr('y', function(d) {
        return d.y;
      })
      .attr('r', function(d: any) {
        return d.r;
      })
      .style('fill', function(d: any, i: any) {
        if(d.data.Name === 'Opportunity'){
          return "#CBF5C4"
        }else if(d.data.Name === 'More information'){
          return "#CBF5C4"
        }else if(d.data.Name === 'Rescheduling'){
          return "#CBF5C4"
        }else if(d.data.Name === 'Internal Call'){
          return "#CBF5C4"
        }else if(d.data.Name === 'Vendor/Solicitor'){
          return "#CBF5C4"
        }else if(d.data.Name === 'Cancellation'){
          return "#FBBFB2"
        }else if(d.data.Name === 'Reached a voicemail prompt but no message left'){
          return "#FBBFB2"
        }else if(d.data.Name === 'Caller Hung up'){
          return "#FBBFB2"
        }else if(d.data.Name === 'No Answer or Busy'){
          return "#FBBFB2"
        }else if(d.data.Name === 'Robo dial'){
          return "#F5EB8E"
        }else if(d.data.Name === 'Personal Call'){
          return "#F5EB8E"
        }else if(d.data.Name === 'Wrong Number'){
          return "#F5EB8E"
        }else if(d.data.Name === 'No Response to IVR'){
          return "#F5EB8E"
        }else if(d.data.Name === 'Other'){
          return "#F5EB8E"
        }
      });

    node
      .append('text')
      .attr('dy', '.2em')
      .style('text-anchor', 'middle')
      .text(function(d: any) {
        return d.data.Name.substring(0, d.r / 3.5);
      })
      .attr('font-family', 'sans-serif')
      .attr('font-size', function(d) {
        return d.r / 5.25;
      })
      .attr('fill', '#4C4C4C');

    node
      .append('text')
      .attr('dy', '1.3em')
      .style('text-anchor', 'middle')
      .text(function(d: any) {
        return '(' + d.data.Count + '%)';
      })
      .attr('font-family', 'Gill Sans')
      .attr('font-size', function(d) {
        return d.r / 5.25;
      })
      .attr('fill', '#4C4C4C');
  }
}
