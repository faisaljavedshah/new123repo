import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'app-recording-analysis-tab',
  templateUrl: './recording-analysis-tab.component.html',
  styleUrls: ['./recording-analysis-tab.component.scss'],
})
export class RecordingAnalysisTabComponent implements OnInit, OnChanges {
  constructor() {}

  ngOnInit(): void {}
  @Input() data: any;

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    console.log('--------->', this.data);
  }
}
