import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';

@Component({
  selector: 'app-periodic-table',
  templateUrl: './periodic-table.component.html',
  styleUrls: ['./periodic-table.component.scss']
})
export class PeriodicTableComponent implements OnInit, OnChanges {
  constructor() {}

  @Input() table: any;
  isData: boolean = false;
  ngOnInit(): void {}
  tableData: Array<any> = ['hj'];
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.table.currentValue) {
      this.tableData = changes.table.currentValue?.indicators;
      this.isData = true;
    }
    // console.log('=============>T', this.tableData);
  }
}
