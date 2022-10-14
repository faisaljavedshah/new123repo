import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import * as moment from 'moment';
// declare const require: any;
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexStroke,
  ApexFill
} from 'ng-apexcharts';
import { DashBoard } from 'src/app/_services/dashboard';
// import { AppService } from '../../../../../_services/app.service';
import { Analysisservice } from '../../../../../_services/DashboardServices/Analysisservice';
import { Industryservice } from '../../../../../_services/DashboardServices/Industryservice';
import { Indicatorsservice } from '../../../../../_services/DashboardServices/Indicatorsservice';
import { Classificationservice } from '../../../../../_services/DashboardServices/Classificationservice';
import { KeyWordServices } from '../../../../../_services/DashboardServices/KeyWordService';
export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  // arraylength : number = this.indicatorsList.length;
  responsive: ApexResponsive[];
  checkedlength: number;
  labels: any;
  stroke: ApexStroke;
  fill: ApexFill;
};
@Component({
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.scss']
})
export class GraphsComponent implements OnInit, OnChanges, OnDestroy {
  constructor(
    private DashBoard: DashBoard,
    private Analysisservice: Analysisservice,
    private Industryservice: Industryservice,
    private Indicatorsservice: Indicatorsservice,
    private classificationservice: Classificationservice,
    private keyWords: KeyWordServices
  ) {}
  dashboardData: any;
  cationDropDown: boolean = false;
  isLoading: boolean = true;
  anaload: boolean = false;
  checkedlength: any;
  dropDownData: any;
  classificationDropdown: any;
  count: number = 0;
  showTick: number = -1;
  showTick1: number = -1;
  polorIndicator: any;
  dummyArr: ['Team 1', 'Team 2', 'Team 3', 'Team 4'];
  tooltipActive : boolean = false
  duplicateIndicators: any;

  periodicDropdown: boolean = false;
  currentTable : string = 'Sales';
  tableTick : number = 0;
  allTables : Array<any> = [];


  indicatorDropdown: boolean = false;
  new_indicator:any
  currentIndicators : string = 'sales';
  IndicatorTick : number = 0;
  ngOnInit(): void {}
  @Input() getRange:string
  ngOnChanges(changes: SimpleChanges): void {
    // console.log(changes, 'onchanges runs-------------------------');
          if(changes.getRange.currentValue){
            this.isLoading = true;
            this.allTables = [];
            if(changes.getRange.currentValue.length === 8){
              this.todayTab(changes.getRange.currentValue);
            }else{
              this.otherTabs(changes.getRange.currentValue)
            }
          }
  }
  todayTab(date:string){
    this.DashBoard.Today(date).subscribe(data => {
      console.log(data, 'today tab response');
    this.dashboardData = data.data;
    this.polorIndicator = data.data;
    this.duplicateIndicators = this.dashboardData.indicators.map(i => {
      i.checked = true;
      return i;
    });
    this.classificationDropdown = Object.keys(
      this.dashboardData.classifications
    );
    data.data.hasOwnProperty('sales_indicators') ? this.allTables.push('sales_indicators') : '';
    data.data.hasOwnProperty('service_indicators') ? this.allTables.push('service_indicators') : '';
    data.data.hasOwnProperty('service_evaluation_indicators') ? this.allTables.push('service_evaluation_indicators') : '';
    data.data.hasOwnProperty('sales_evaluation_indicators') ? this.allTables.push('sales_evaluation_indicators') : '';
    this.allTables.push('indicators');
    console.log(this.DashBoard.currentDropdownItem);

    this.currentTable = this.allTables[this.DashBoard.currentDropdownItem] ? this.allTables[this.DashBoard.currentDropdownItem] : this.allTables[0];
    this.currentIndicators = this.allTables[this.DashBoard.currentDropdownItem] ? this.allTables[this.DashBoard.currentDropdownItem] : this.allTables[0];
    this.changeIndicators(this.currentIndicators, this.DashBoard.currentDropdownItem)
    this.isLoading = false;
  });
  }
  otherTabs(date:string){
    let firstDate : string = date.slice(0,8);
    let lastDate : string = date.slice(9,17);
    this.DashBoard.Dashboard(firstDate, lastDate).subscribe(data => {
      console.log(data, 'other tabs data');

      this.dashboardData = data.data;

      this.polorIndicator = data.data;
      this.count = this.dashboardData.indicators.length;
      this.indicatorsList = this.dashboardData.indicators.map(i => {
        i.checked = true;
        return i;
      });
      this.duplicateIndicators = this.dashboardData.indicators.map(i => {
        i.checked = true;
        return i;
      });
      this.dropDownData = this.dashboardData.indicators.map(abc => {
        return abc.indicator;
      });
      this.classificationDropdown = Object.keys(
        this.dashboardData.classifications
      );
      data.data.hasOwnProperty('sales_indicators') ? this.allTables.push('sales_indicators') : '';
      data.data.hasOwnProperty('service_indicators') ? this.allTables.push('service_indicators') : '';
      data.data.hasOwnProperty('service_evaluation_indicators') ? this.allTables.push('service_evaluation_indicators') : '';
      data.data.hasOwnProperty('sales_evaluation_indicators') ? this.allTables.push('sales_evaluation_indicators') : '';
      this.allTables.push('indicators');
      console.log(this.DashBoard.currentDropdownItem);
      this.currentTable = this.allTables[this.DashBoard.currentDropdownItem] ? this.allTables[this.DashBoard.currentDropdownItem] : this.allTables[0];
      this.currentIndicators = this.allTables[this.DashBoard.currentDropdownItem] ? this.allTables[this.DashBoard.currentDropdownItem] : this.allTables[0];
      this.changeIndicators(this.currentIndicators, this.DashBoard.currentDropdownItem)
      this.isLoading = false;
    });
  }
  indicatorsList: any;
  masterToggle = true;
  check = false;
  selectall(e) {
    if (e) {
      this.masterToggle = true;
      this.count = this.indicatorsList.length;
      this.indicatorsList = this.indicatorsList.map(i => {
        i.checked = true;
        return i;
      });
      this.abcc = this.indicatorsList.map(i => {
        i.checked = true;
        return i;
      });
    } else {
      this.count = 0;
      this.masterToggle = false;
      this.indicatorsList = this.indicatorsList.map(i => {
        i.checked = false;
        return i;
      });
      let indi = [...this.indicatorsList];
      this.abcc = indi.map(i => {
        return i;
      });
    }
  }

  CallAnalysisClicked() {
    const abc = JSON.stringify(this.dashboardData.call_analysis);
    const blob = new Blob([abc], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    window.open(url);
  }
  calIndurstyClicked() {
    const abc = JSON.stringify(this.dashboardData.industries);
    const blob = new Blob([abc], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    window.open(url);
  }
  callIndecatores() {
    const abc = JSON.stringify(this.dashboardData.indicators);
    const blob = new Blob([abc], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    window.open(url);
  }
  classification() {
    const abc = JSON.stringify(this.dashboardData.classifications);
    const blob = new Blob([abc], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    window.open(url);
  }
  IconClicked() {
    alert('Clcked');
  }

  indecatorDropDown: boolean = false;
  DindecatorDropDown: boolean = false;
  classificationDropDown: boolean = false;
  classificationDropDown2: boolean = false;
  abcc: any = [];
  countChecking(e, item) {
    // this.count = this.indicatorsList.length;
    if (e === true) {
      this.count++;
    }
    if (this.count === this.indicatorsList.length) {
      this.masterToggle = true;
    }
    if (e === false) {
      this.masterToggle = false;
      this.count--;
    }
  }
  resetall() {
    this.count = this.totalIndicatorsLength;
    this.masterToggle = true;
    this.indicatorsList = this.dashboardData[this.currentIndicators].map(i => {
      i.checked = true;
      return i;
    });
    this.currentGraph = this.indicatorsList;
    this.abcc = [];
    console.log(this.indicatorsList);
  }
  applyBtnClicked() {
    this.abcc = this.indicatorsList.filter(data => {
      return data.checked;
    });
    this.currentGraph =  this.abcc;
    this.indecatorDropDown = false;
  }
  currentGraph : any = []
  totalIndicatorsLength : number = 0
  changeIndicators(e, index){
    this.tableTick = this.allTables[this.DashBoard.currentDropdownItem] ? this.DashBoard.currentDropdownItem : 0;
    this.DashBoard.currentDropdownItem = index;
    this.currentIndicators = e;
    this.currentGraph = this.dashboardData[e];
    this.count = this.dashboardData[e]?.length;
    this.indicatorsList = this.dashboardData[e]?.map(i => {
      i.checked = true;
      return i;
    });
    this.totalIndicatorsLength =  this.indicatorsList.length;
    this.masterToggle = true;
  }
  changeTable(e, index){
    this.DashBoard.currentDropdownItem = index;
    this.currentTable = e;
  }
  //download drop
  isDropDownActive: boolean = false;
  isDropDownActive1: boolean = false;
  isDropDownActive2: boolean = false;
  isDropDownActive3: boolean = false;
  isDropDownActive4: boolean = false;
  isDropDownActive5: boolean = false;
  isDropDownActive6: boolean = false;
  onDownload() {
    alert('Downloading...');
  }

  //download pdf and csv start from here
  ConvertToCSV(objArray, headerList) {
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = 'S.No,';

    for (let index in headerList) {
      row += headerList[index] + ',';
    }
    row = row.slice(0, -1);
    str += row + '\r\n';
    for (let i = 0; i < array.length; i++) {
      let line = i + 1 + '';
      for (let index in headerList) {
        let head = headerList[index];

        line += ',' + array[i][head];
      }
      str += line + '\r\n';
    }
    return str;
  }
  isShowBtn: boolean = true;
  arr = [];
  analysisArr = [];
  analysisArrcla = [];
  analysisArrind = [];
  analysisArrs = [];
  predicttable: boolean = false;
  @ViewChild('test') el: ElementRef;
  UserName = localStorage.getItem('user');
  async onTablePdfClick() {
    if (this.PDFTable) {
      this.predicttable = true;
    }
    await new Promise(r => setTimeout(r, 500));
    let userName = JSON.parse(this.UserName);
    if (this.PDFTable) {
      let DATA = document.getElementById('PredictesTable');
      html2canvas(DATA).then(canvas => {
        let fileWidth = 208;
        let fileHeight = (canvas.height * fileWidth) / canvas.width;
        const FILEURI = canvas.toDataURL('image/png');
        let PDF = new jsPDF('p', 'mm', 'a4');
        let position = 0;
        PDF.addImage(FILEURI, 'PNG', 0, position, fileWidth, fileHeight);
        PDF.save('Periodic Table(' + userName.data.user.name + ')');
        this.predicttable = false;
      });
      this.PDFTable = '';
    }
  }
  async OnAnalysisClicked() {
    if (this.PDF) {
      this.anaload = true;
    }
    this.isShowBtn = false;
    await new Promise(r => setTimeout(r, 500));
    let userName = JSON.parse(this.UserName);
    if (this.PDF) {
      let DATA = document.getElementById('Analysis');
      html2canvas(DATA).then(canvas => {
        let fileWidth = 208;
        let fileHeight = (canvas.height * fileWidth) / canvas.width;
        const FILEURI = canvas.toDataURL('image/png');
        let PDF = new jsPDF('p', 'mm', 'a4');
        let position = 60;
        PDF.addImage(FILEURI, 'PNG', 0, position, fileWidth, fileHeight);
        PDF.save('Call Analysis(' + userName.data.user.name + ')');
        this.anaload = false;
        this.isShowBtn = true;
      });
      this.PDF = '';
    }
    if (this.CSV) {
      const data = this.dashboardData.call_analysis;
      this.arr.push(data);
      console.log(this.arr);
      this.Analysisservice.downloadFile(
        this.arr,
        'Call Analysis(' + userName.data.user.name + ')'
      );
      this.CSV = '';
      this.arr = [];
    }
  }
  industrytub: boolean = false;
  async OnIndustryClicked() {
    if (this.PDFIndustry) {
      this.industrytub = true;
      this.tooltipActive = true;
    }
    await new Promise(r => setTimeout(r, 500));
    let userName = JSON.parse(this.UserName);
    if (this.PDFIndustry) {
      // document.getElementById('HideCallIndursty').style.display = 'none';
      let DATA = document.getElementById('Industry');
      html2canvas(DATA).then(canvas => {
        let fileWidth = 208;
        let fileHeight = (canvas.height * fileWidth) / canvas.width;
        const FILEURI = canvas.toDataURL('image/png');
        let PDF = new jsPDF('p', 'mm', 'a4');
        let position = 60;
        PDF.addImage(FILEURI, 'PNG', 0, position, fileWidth, fileHeight);
        PDF.save('Call Industry(' + userName.data.user.name + ')');
        this.industrytub = false;
        this.tooltipActive = false;
      });
      // document.getElementById('HideCallIndursty').style.display = 'block';
      this.PDFIndustry = '';
    }
    if (this.CSVIndustry) {
      const data = this.dashboardData.industries;
      this.arr.push(data);
      this.Industryservice.downloadFile(
        data,
        'Call Industry(' + userName.data.user.name + ')'
      );
      this.CSVIndustry = '';
      this.arr = [];
    }
  }
  sindicate: boolean = false;
  async OnIndicatorsClicked() {
    if (this.PDFIndicators) {
      this.sindicate = true;
    }
    await new Promise(r => setTimeout(r, 500));
    let userName = JSON.parse(this.UserName);
    if (this.PDFIndicators) {
      // document.getElementById('HideCallIndicators').style.display = 'none';
      let DATA = document.getElementById('Indicators');
      html2canvas(DATA).then(canvas => {
        let fileWidth = 208;
        let fileHeight = (canvas.height * fileWidth) / canvas.width;
        const FILEURI = canvas.toDataURL('image/png');
        let PDF = new jsPDF('p', 'mm', 'a4');
        let position = 60;
        PDF.addImage(FILEURI, 'PNG', 0, position, fileWidth, fileHeight);
        PDF.save('Call Indicators(' + userName.data.user.name + ')');
        this.sindicate = false;
      });
      // document.getElementById('HideCallIndicators').style.display = 'block';

      this.PDFIndicators = '';
    }
    if (this.CSVIndicators) {
      const data = this.currentGraph;
      // console.log(data);
      // console.log(this.currentGraph);

      this.arr.push(data);
      this.Indicatorsservice.downloadFile(
        data,
        'Call Indicators(' + userName.data.user.name + ')'
      );
      this.CSVIndicators = '';
      this.arr = [];
    }
  }
  classi: boolean = false;
  async OnclassificationClicked() {
    if (this.PDFClassfication) {
      this.classi = true;
    }
    await new Promise(r => setTimeout(r, 500));
    let userName = JSON.parse(this.UserName);
    if (this.PDFClassfication) {
      // document.getElementById('HideCallClassification').style.display = 'none';
      let DATA = document.getElementById('Classifications');
      html2canvas(DATA).then(canvas => {
        let fileWidth = 208;
        let fileHeight = (canvas.height * fileWidth) / canvas.width;
        const FILEURI = canvas.toDataURL('image/png');
        let PDF = new jsPDF('p', 'mm', 'a4');
        let position = 60;
        PDF.addImage(FILEURI, 'PNG', 0, position, fileWidth, fileHeight);
        PDF.save('Call Classifications(' + userName.data.user.name + ')');
        this.classi = false;
      });
      // document.getElementById('HideCallClassification').style.display = 'block';
      this.PDFClassfication = '';
    }
    if (this.CSVClassfication) {
      const data = this.dashboardData.classifications;
      this.arr.push(data);
      this.classificationservice.downloadFile(
        this.arr,
        'Call Classifications(' + userName.data.user.name + ')'
      );
      this.CSVClassfication = '';
      this.arr = [];
    }
  }
  callkey: boolean = false;
  async onKeywordClick() {
    if (this.PDFKeywords) {
      this.callkey = true;
    }
    await new Promise(r => setTimeout(r, 500));
    let userName = JSON.parse(this.UserName);
    if (this.PDFKeywords) {
      // document.getElementById('HideCallKeyWord').style.display = 'none';
      let DATA = document.getElementById('keywordss');
      html2canvas(DATA).then(canvas => {
        let fileWidth = 208;
        let fileHeight = (canvas.height * fileWidth) / canvas.width;
        const FILEURI = canvas.toDataURL('image/png');
        let PDF = new jsPDF('p', 'mm', 'a4');
        let position = 60;
        PDF.addImage(FILEURI, 'PNG', 0, position, fileWidth, fileHeight);
        PDF.save('Call KeyWords(' + userName.data.user.name + ')');
        this.callkey = false;
      });
      // document.getElementById('HideCallKeyWord').style.display = 'block';

      this.PDFKeywords = '';
    }
    if (this.CSVKeywords) {
      const KeyWordData : string = this.dashboardData.keywords;

      let split = KeyWordData.split(' ');
      split = split.map(item =>{
          if(item[item.length - 1] === '.' || item[item.length - 1] === ',' || item[item.length - 1] === '?'){
            return item.slice(0, item.length - 1).toLowerCase();
          }
        return item.trim().toLowerCase();
      })
      let obj = {};
      for (let i = 0; i < split.length; i++) {
        if (obj[split[i]] === undefined) {
          if (split.length == 0) {
            obj[split[i]] = '';
          } else {
            obj[split[i]] = 1;
          }
        } else {
          obj[split[i]]++;
        }
      }
      this.keyWords.downloadFile(
        obj,
        'Call KeyWords(' + userName.data.user.name + ')'
      );
      this.CSVKeywords = '';
    }
  }

  PDF: any;
  PDFTable: any;
  CSV: any;
  PDFIndustry: any;
  CSVIndustry: any;
  PDFIndicators: any;
  CSVIndicators: any;
  PDFClassfication: any;
  CSVClassfication: any;
  PDFKeywords: any;
  CSVKeywords: any;
  showOptions(e, val) {
    if (val == 'PDF') {
      this.PDF = e.checked;
    }
    if (val == 'CSV') {
      this.CSV = e.checked;
    }
  }
  showOptionsTable(e, val) {
    if (val == 'PDF') {
      this.PDFTable = e.checked;
    }
    if (val == 'CSV') {
      this.CSVIndustry = e.checked;
    }
  }
  showOptionsIndustry(e, val) {
    if (val == 'PDF') {
      this.PDFIndustry = e.checked;
    }
    if (val == 'CSV') {
      this.CSVIndustry = e.checked;
    }
  }
  showOptionsIndicators(e, val) {
    if (val == 'PDF') {
      this.PDFIndicators = e.checked;
    }
    if (val == 'CSV') {
      this.CSVIndicators = e.checked;
    }
  }
  showOptionsClassification(e, val) {
    if (val == 'PDF') {
      this.PDFClassfication = e.checked;
    }
    if (val == 'CSV') {
      this.CSVClassfication = e.checked;
    }
  }
  showOptionsKeywords(e, val) {
    if (val == 'PDF') {
      this.PDFKeywords = e.checked;
    }
    if (val == 'CSV') {
      this.CSVKeywords = e.checked;
    }
  }
  ngOnDestroy(): void {
    this.dashboardData = undefined;
    this.polorIndicator = undefined;
    this.allTables = [];
  }
  functionOne() {
    return new Promise<void>(resolve => {
      console.log('one');
      this.anaload = true;
      resolve();
    });
  }

  functionTwo() {
    return new Promise<void>(resolve => {
      console.log('two');
      this.OnAnalysisClicked();
      resolve();
    });
  }
  openTryFunction() {
    // function one
    this.functionOne().then(() => {
      this.functionTwo();
    });
  }
  renderItemsDrop: any = 'All Team';
  renderItemsDrop2: any = 'All Team';
  changeItemLength(e) {
    console.log(e);
    this.renderItemsDrop = e;
    this.classificationDropDown2 = false;
  }
  changeItemLength2(e) {
    console.log(e);
    this.renderItemsDrop2 = e;
    this.classificationDropDown = false;
  }
}
