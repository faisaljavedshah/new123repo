import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';

@Component({
  selector: 'app-periodic-tables',
  templateUrl: './periodic-tables.component.html',
  styleUrls: ['./periodic-tables.component.scss']
})
export class PeriodicTablesComponent implements OnInit, OnChanges {
  constructor() {}

  @Input() table: any;
  isData: boolean = false;
  ngOnInit(): void {}
  tableData: Array<any> = ['hj'];
  ngOnChanges(changes: SimpleChanges): void {
    // console.log(changes, '===========================================new table');

    if (changes.table?.currentValue) {
      this.tableData = changes.table.currentValue;
      // console.log(this.tableData);
      this.isData = true;
    }
  }
  getInitails(e: string){

      let words: any = e.split(' ');
      // console.log(words);
      // words.replace('  ',' ');
      if(words.length === 1){
        // console.log(words[0][0] + words[0][1]);
        return words[0][0] + words[0][1]

      }
     else if(words.length === 2){
        return words[0][0] + words[1][0]
      } else if(words.length > 2){
        var str = words[0][0] ;
        if(words[1] !==undefined && words[1][0] !== undefined && words[1][0] != "-"){
          str += words[1][0];
        }
        if(words[2] !==undefined && words[2][0] !== undefined && words[2][0] != "-"){
          str += words[2][0];
        }
        else if (words[3] !==undefined && words[3][0] !== undefined){
          str += words[3][0];
        }
        return str
      }
  }
}
