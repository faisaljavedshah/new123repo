import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  copyArrayItem,
  CdkDragStart,
} from '@angular/cdk/drag-drop';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import remove from 'lodash-es/remove';
import * as _ from 'lodash'
import { RecordingLists } from 'src/app/_services/recordingList';
import { TeamService } from 'src/app/_services/team.service';


@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss']
})
export class TeamsComponent implements OnInit, OnChanges {
  toggleList: boolean = false;
  isDateDropdown4 : boolean = false;
  currenttteam : string = ''
  closeModal: string;
  matricDropdown : boolean = false;
  isLoading : boolean = true;
  teamAverage : any
  allIndicators : any
  you : any
  @Input() getRange:string;
  constructor(
    private modalService: NgbModal,
    public listOfRecording: RecordingLists,
    private _teamService : TeamService
  ) { }

  ngOnInit(): void {
  }
  ngOnChanges(changes : SimpleChanges): void{
    if(changes.getRange?.currentValue){
      this.isLoading = true;
      this.makeObj1(this.getRange);
    }
  }
  teamObject:any = {}
  dropdownGroup : string = ''
  makeObj(e){
    this.dropdownGroup = e;
    this.teamObject.group_id = this.dropdownGroup;
    this.getTeamsData();
  }
  makeObj1(e){
    this.currentDate = e;
    if(this.currentDate.length === 8){
        this.teamObject.start_date =this.currentDate;
        this.teamObject.end_date =this.currentDate
    }else{
      this.teamObject.start_date =this.currentDate.slice(0,8);
        this.teamObject.end_date =this.currentDate.slice(9,17)
    }
    this.getTeamsData();
  }
  currentDate : string = ''
  getTeamsData(){
    this._teamService.getTeams(this.teamObject).subscribe(res=>{
      console.log(res);
      if(res.status === 'success'){
        this._teamService.activeUsers = res.data.activeUsers;
        this._teamService.totalUsers = res.data.totalUsers;
        this._teamService.userImages = res.data.images;
        this.allIndicators = res.data;
        this.sItems = [...res.data.performance].map(item =>{
          item.isHovered = false;
          item.imgSrc = 'assets/avatar/avt1.png';
          return item;
        });
        this.duplicateLeader = [...res.data.performance].map(item =>{
          item.isHovered = false;
          item.imgSrc = 'assets/avatar/avt1.png';
          return item;
        });
        let arr = JSON.parse(JSON.stringify(this.sItems));
        this.dItems = arr.filter(item=>{
          if(item.name === 'you' || item.name === 'Team Average' || item.position === 1 ){
            if(item.name === 'Team Average'){
              this.teamAverage = item;
            }
            if(item.name === 'you'){
              this.you = item;
            }
            if(item.position === 1 && item.name !== 'you'){
              item.name = 'Champion'
            }
            return item
          }
        });
        this.duplicateMetrics = arr.filter(item=>{
          if(item.name === 'you' || item.name === 'Team Average' || item.position === 1){
            if(item.position === 1 && item.name !== 'you'){
              item.name = 'Champion'
            }
            return item
          }
        });
        this.sItems = this.sItems.filter(item=>{
          return item.id !== 0
        })
        this.isLoading = false;
      }
    })
  }
  isDragging: boolean = false;

  sItems: Array<any> = [
    {
      id: 1,
      name: 'Alexi',
      points: '576',
      isHovered : false,
      position: '1',
      imgSrc: 'assets/avatar/avt1.png',
      analysis: {
        totalCalls: '170',
        totalLeads: '165',
        avgDuration: '00:01',
        callEff: '93%',
        conversions: '170',
        missedOpp: '165',
        champCalls: '10',
        coachCalls: '30',
      },
    },
    {
      id: 2,
      name: 'Jinnhi',
      points: '521',
      isHovered : false,
      position: '2',
      imgSrc: 'assets/avatar/avt2.png',
      analysis: {
        totalCalls: '170',
        totalLeads: '165',
        avgDuration: '00:01',
        callEff: '93%',
        conversions: '170',
        missedOpp: '165',
        champCalls: '20',
        coachCalls: '30',
      },
    },
    {
      id: 3,
      name: 'Jane Doe',
      points: '453',
      isHovered : false,
      position: '3',
      imgSrc: 'assets/avatar/avt3.png',
      analysis: {
        totalCalls: '170',
        totalLeads: '165',
        avgDuration: '00:01',
        callEff: '93%',
        conversions: '170',
        missedOpp: '165',
        champCalls: '30',
        coachCalls: '30',
      },
    },
    {
      id: 4,
      name: 'You',
      points: '112',
      isHovered : false,
      position: '4',
      imgSrc: 'assets/avatar/avt4.png',
      analysis: {
        totalCalls: '170',
        totalLeads: '165',
        avgDuration: '00:01',
        callEff: '93%',
        conversions: '170',
        missedOpp: '165',
        champCalls: '40',
        coachCalls: '30',
      },
    },
    {
      id: 5,
      name: 'Marry',
      points: '112',
      isHovered : false,
      position: '5',
      imgSrc: 'assets/avatar/avt1.png',
      analysis: {
        totalCalls: '170',
        totalLeads: '165',
        avgDuration: '00:01',
        callEff: '93%',
        conversions: '170',
        missedOpp: '165',
        champCalls: '50',
        coachCalls: '30',
      },
    },
    {
      id: 6,
      name: 'Charistina',
      points: '112',
      isHovered : false,
      position: '6',
      imgSrc: 'assets/avatar/avt2.png',
      analysis: {
        totalCalls: '170',
        totalLeads: '165',
        avgDuration: '00:01',
        callEff: '93%',
        conversions: '170',
        missedOpp: '165',
        champCalls: '60',
        coachCalls: '30',
      },
    },
    {
      id: 7,
      name: 'Toni',
      points: '112',
      isHovered : false,
      position: '7',
      imgSrc: 'assets/avatar/avt3.png',
      analysis: {
        totalCalls: '170',
        totalLeads: '165',
        avgDuration: '00:01',
        callEff: '93%',
        conversions: '170',
        missedOpp: '165',
        champCalls: '70',
        coachCalls: '30',
      },
    },
    {
      id: 8,
      name: 'Maria',
      points: '112',
      isHovered : false,
      position: '8',
      imgSrc: 'assets/avatar/avt4.png',
      analysis: {
        totalCalls: '170',
        totalLeads: '165',
        avgDuration: '00:01',
        callEff: '93%',
        conversions: '170',
        missedOpp: '165',
        champCalls: '80',
        coachCalls: '30',
      },
    },
    {
      id: 9,
      name: 'Rose',
      points: '112',
      isHovered : false,
      position: '9',
      imgSrc: 'assets/avatar/avt4.png',
      analysis: {
        totalCalls: '170',
        totalLeads: '165',
        avgDuration: '00:01',
        callEff: '93%',
        conversions: '170',
        missedOpp: '165',
        champCalls: '90',
        coachCalls: '30',
      },
    },
    {
      id: 10,
      name: 'Mishi',
      points: '112',
      isHovered : false,
      position: '10',
      imgSrc: 'assets/avatar/avt4.png',
      analysis: {
        totalCalls: '170',
        totalLeads: '165',
        avgDuration: '00:01',
        callEff: '93%',
        conversions: '170',
        missedOpp: '165',
        champCalls: '100',
        coachCalls: '30',
      },
    },
    {
      id: 11,
      name: 'Jenny',
      points: '112',
      isHovered : false,
      position: '11',
      imgSrc: 'assets/avatar/avt4.png',
      analysis: {
        totalCalls: '170',
        totalLeads: '165',
        avgDuration: '00:01',
        callEff: '93%',
        conversions: '170',
        missedOpp: '165',
        champCalls: '110',
        coachCalls: '30',
      },
    },
  ];
  dItems: Array<any> = [];
  duplicateMetrics: any = [
    {
      id: 0,
      name: 'Champion',
      points: '1112',
      position: '9',
      imgSrc: 'assets/avatar/avt4.png',
      analysis: {
        totalCalls: '170',
        totalLeads: '165',
        avgDuration: '00:01',
        callEff: '93%',
        conversions: '170',
        missedOpp: '165',
        champCalls: '20',
        coachCalls: '30',
      },
    },
    {
      id: 4,
      name: 'You',
      points: '363',
      position: '4',
      imgSrc: 'assets/avatar/avt4.png',
      analysis: {
        totalCalls: '170',
        totalLeads: '165',
        avgDuration: '00:01',
        callEff: '93%',
        conversions: '170',
        missedOpp: '165',
        champCalls: '20',
        coachCalls: '30',
      },
    },
    {
      id: 0,
      name: 'Team Average',
      points: '298',
      position: '11',
      imgSrc: 'assets/avatar/avt4.png',
      analysis: {
        totalCalls: '170',
        totalLeads: '165',
        avgDuration: '00:01',
        callEff: '93%',
        conversions: '170',
        missedOpp: '165',
        champCalls: '20',
        coachCalls: '30',
      },
    },
  ];
  duplicateLeader = [
    {
      id: 1,
      name: 'Alexi',
      points: '576',
      isHovered : false,
      position: '1',
      imgSrc: 'assets/avatar/avt1.png',
      analysis: {
        totalCalls: '170',
        totalLeads: '165',
        avgDuration: '00:01',
        callEff: '93%',
        conversions: '170',
        missedOpp: '165',
        champCalls: '10',
        coachCalls: '30',
      },
    },
    {
      id: 2,
      name: 'Jinnhi',
      points: '521',
      isHovered : false,
      position: '2',
      imgSrc: 'assets/avatar/avt2.png',
      analysis: {
        totalCalls: '170',
        totalLeads: '165',
        avgDuration: '00:01',
        callEff: '93%',
        conversions: '170',
        missedOpp: '165',
        champCalls: '20',
        coachCalls: '30',
      },
    },
    {
      id: 3,
      name: 'Jane Doe',
      points: '453',
      isHovered : false,
      position: '3',
      imgSrc: 'assets/avatar/avt3.png',
      analysis: {
        totalCalls: '170',
        totalLeads: '165',
        avgDuration: '00:01',
        callEff: '93%',
        conversions: '170',
        missedOpp: '165',
        champCalls: '30',
        coachCalls: '30',
      },
    },
    {
      id: 4,
      name: 'You',
      points: '112',
      isHovered : false,
      position: '4',
      imgSrc: 'assets/avatar/avt4.png',
      analysis: {
        totalCalls: '170',
        totalLeads: '165',
        avgDuration: '00:01',
        callEff: '93%',
        conversions: '170',
        missedOpp: '165',
        champCalls: '40',
        coachCalls: '30',
      },
    },
    {
      id: 5,
      name: 'Marry',
      points: '112',
      isHovered : false,
      position: '5',
      imgSrc: 'assets/avatar/avt1.png',
      analysis: {
        totalCalls: '170',
        totalLeads: '165',
        avgDuration: '00:01',
        callEff: '93%',
        conversions: '170',
        missedOpp: '165',
        champCalls: '50',
        coachCalls: '30',
      },
    },
    {
      id: 6,
      name: 'Charistina',
      points: '112',
      isHovered : false,
      position: '6',
      imgSrc: 'assets/avatar/avt2.png',
      analysis: {
        totalCalls: '170',
        totalLeads: '165',
        avgDuration: '00:01',
        callEff: '93%',
        conversions: '170',
        missedOpp: '165',
        champCalls: '60',
        coachCalls: '30',
      },
    },
    {
      id: 7,
      name: 'Toni',
      points: '112',
      isHovered : false,
      position: '7',
      imgSrc: 'assets/avatar/avt3.png',
      analysis: {
        totalCalls: '170',
        totalLeads: '165',
        avgDuration: '00:01',
        callEff: '93%',
        conversions: '170',
        missedOpp: '165',
        champCalls: '70',
        coachCalls: '30',
      },
    },
    {
      id: 8,
      name: 'Maria',
      points: '112',
      isHovered : false,
      position: '8',
      imgSrc: 'assets/avatar/avt4.png',
      analysis: {
        totalCalls: '170',
        totalLeads: '165',
        avgDuration: '00:01',
        callEff: '93%',
        conversions: '170',
        missedOpp: '165',
        champCalls: '80',
        coachCalls: '30',
      },
    },
    {
      id: 9,
      name: 'Rose',
      points: '112',
      isHovered : false,
      position: '9',
      imgSrc: 'assets/avatar/avt4.png',
      analysis: {
        totalCalls: '170',
        totalLeads: '165',
        avgDuration: '00:01',
        callEff: '93%',
        conversions: '170',
        missedOpp: '165',
        champCalls: '90',
        coachCalls: '30',
      },
    },
    {
      id: 10,
      name: 'Mishi',
      points: '112',
      isHovered : false,
      position: '10',
      imgSrc: 'assets/avatar/avt4.png',
      analysis: {
        totalCalls: '170',
        totalLeads: '165',
        avgDuration: '00:01',
        callEff: '93%',
        conversions: '170',
        missedOpp: '165',
        champCalls: '100',
        coachCalls: '30',
      },
    },
    {
      id: 11,
      name: 'Jenny',
      points: '112',
      isHovered : false,
      position: '11',
      imgSrc: 'assets/avatar/avt4.png',
      analysis: {
        totalCalls: '170',
        totalLeads: '165',
        avgDuration: '00:01',
        callEff: '93%',
        conversions: '170',
        missedOpp: '165',
        champCalls: '110',
        coachCalls: '30',
      },
    },
  ];
  metricsList = [
    { checked: true, title: 'Total Calls', id: 'totalCalls' },
    { checked: true, title: 'Total leads', id: 'totalLeads' },
    { checked: true, title: 'Avg. duration', id: 'avgDuration' },
    { checked: true, title: 'Call efficiency', id: 'callEff' },
    { checked: true, title: 'Conversions', id: 'conversions' },
    { checked: true, title: 'Missed opportunities', id: 'missedOpp' },
    { checked: true, title: 'Champion calls', id: 'champCalls' },
    { checked: true, title: 'Coachable Calls', id: 'coachCalls' },
  ]
  checkedMetrics = ['totalCalls', 'totalLeads', 'avgDuration', 'callEff', 'conversions', 'missedOpp', 'champCalls', 'coachCalls',];
  isAlready: boolean = false;
  isListFull: boolean = false;
  bodyElement: HTMLElement = document.body;
  getCurrentVals() {
    // let ab = [...this.duplicateMetrics]
    // let abc = [...this.duplicateLeader]

    // this.dItems.map((i, index) => {
    //   i = _.pick(ab[index], [...this.reflectionList]);
    //   // this.addProps(ab[index].analysis, index)
    // });
    let alter : Array<any> = [];
    let Metrics = JSON.parse(JSON.stringify(this.duplicateMetrics));
    Metrics.filter(item=>{
      let obj = {};
      this.reflectionList.forEach(i=>{
        obj[i] = item[i];
      })
      obj['id'] = item['id']
      obj['position'] = item['position']
      obj['imgSrc'] = item['imgSrc']
      obj['isHovered'] = item['isHovered']
      obj['name'] = item['name']
      obj['points'] = item['points'];
      alter.push(obj);
      return obj
    })
    this.dItems = alter;
  }
  destinationDropped(event: CdkDragDrop<string[]>) {
    // if (this.dItems.length >= 8) {
    //   moveItemInArray(
    //     event.container.data,
    //     event.previousIndex,
    //     event.currentIndex
    //   );
    //   return;
    // }
    this.bodyElement.classList.remove('inheritCursors');
    this.bodyElement.style.cursor = 'unset';

    if (event.previousContainer === event.container) {
      this.dItems = event.container.data;
      // this.duplicateMetrics = event.container.data;

      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
        );
    } else {
      this.duplicateMetrics.splice(event.currentIndex, 0, event.item.data);
      this.dItems = event.container.data;
      copyArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
        );

      }
        // this.getCurrentVals();
    if (event.previousContainer.data) {
      remove(this.sItems, { temp: true });
    }
  }

  noReturnPredicate() {
    return false;
  }

  removeBox(id: number) {
    this.dItems = this.dItems.filter((item) => item.id != id);
    this.duplicateMetrics = this.duplicateMetrics.filter((item) => item.id != id);
  }
  dragStart(event: CdkDragStart) {
    this.bodyElement.classList.add('inheritCursors');
    this.bodyElement.style.cursor = 'move';
  }
  endDragging() {
    this.bodyElement.classList.remove('inheritCursors');
    this.bodyElement.style.cursor = 'unset';
  }
  isHoverEffect: boolean = false;
  checkList(id) {
    this.isHoverEffect = this.dItems.some((d) => d.id == id);
  }
  onChangeLangg(e) {
    this.isDateDropdown4 = false;
    this.currenttteam = e;
  }
  classEntered: boolean = false;
  entered() {
    this.classEntered = true;
  }
  exited() {
    this.classEntered = false;
  }
  triggerModal(content) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (res) => {
          this.closeModal = `Closed with: ${res}`;
        },
        (res) => {
          this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
        }
      );
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  reflectionList: Array<any> = ['totalCalls', 'totalLeads', 'avgDuration', 'callEff', 'conversions', 'missedOpp', 'champCalls', 'coachCalls']
  metricsObject = {totalCalls : 'totalCalls',totalLeads : 'totalLeads',avgDuration : 'avgDuration',callEff : 'callEff',conversions : 'conversions',missedOpp : 'missedOpp',champCalls : 'champCalls',coachCalls : 'coachCalls'}
  duplicateMetricsObject = {totalCalls : 'totalCalls',totalLeads : 'totalLeads',avgDuration : 'avgDuration',callEff : 'callEff',conversions : 'conversions',missedOpp : 'missedOpp',champCalls : 'champCalls',coachCalls : 'coachCalls'}
  selectMetrics(e, id:string) {
    if (e) {
      this.metricsObject[id] = id;
      this.reflectionList.push(id);
    } else {
      delete this.metricsObject[id]
      this.reflectionList = this.reflectionList.filter(d => {
        return d !== id
      })
    }
  }
  applyMetrics() {
    this.duplicateMetricsObject = {...this.metricsObject};
    if (this.reflectionList.length === 0) {
      this.reflectionList = ['totalCalls'];
      this.metricsList = [
        { checked: true, title: 'Total Calls', id: 'totalCalls' },
        { checked: false, title: 'Total leads', id: 'totalLeads' },
        { checked: false, title: 'Avg. duration', id: 'avgDuration' },
        { checked: false, title: 'Call efficiency', id: 'callEff' },
        { checked: false, title: 'Conversions', id: 'conversions' },
        { checked: false, title: 'Missed opportunities', id: 'missedOpp' },
        { checked: false, title: 'Champion calls', id: 'champCalls' },
        { checked: false, title: 'Coachable Calls', id: 'coachCalls' },
      ]
    }

    // this.getCurrentVals();
    this.checkedMetrics = [...this.reflectionList]
  }
  resetMetricsFilter() {
    this.metricsList = [
      { checked: true, title: 'Total Calls', id: 'totalCalls' },
      { checked: true, title: 'Total leads', id: 'totalLeads' },
      { checked: true, title: 'Avg. duration', id: 'avgDuration' },
      { checked: true, title: 'Call efficiency', id: 'callEff' },
      { checked: true, title: 'Conversions', id: 'conversions' },
      { checked: true, title: 'Missed opportunities', id: 'missedOpp' },
      { checked: true, title: 'Champion calls', id: 'champCalls' },
      { checked: true, title: 'Coachable Calls', id: 'coachCalls' },
    ]
    this.metricsObject = {totalCalls : 'totalCalls',totalLeads : 'totalLeads',avgDuration : 'avgDuration',callEff : 'callEff',conversions : 'conversions',missedOpp : 'missedOpp',champCalls : 'champCalls',coachCalls : 'coachCalls'}
  this.duplicateMetricsObject = {totalCalls : 'totalCalls',totalLeads : 'totalLeads',avgDuration : 'avgDuration',callEff : 'callEff',conversions : 'conversions',missedOpp : 'missedOpp',champCalls : 'champCalls',coachCalls : 'coachCalls'}
    this.checkedMetrics = ['totalCalls', 'totalLeads', 'avgDuration', 'callEff', 'conversions', 'missedOpp', 'champCalls', 'coachCalls',];
    this.reflectionList = ['totalCalls', 'totalLeads', 'avgDuration', 'callEff', 'conversions', 'missedOpp', 'champCalls', 'coachCalls',];
    this.getCurrentVals();
  }
  getItemName(item) {
    if (item === 'totalCalls') {
      return 'Total Calls';
    }
    else if (item === 'totalLeads') {
      return 'Total leads'
    }
    else if (item === 'avgDuration') {
      return 'Avg. duration'
    }
    else if (item === 'callEff') {
      return 'Call efficiency'
    }
    else if (item === 'conversions') {
      return 'Conversions'
    }
    else if (item === 'missedOpp') {
      return 'Missed opportunities'
    }
    else if (item === 'champCalls') {
      return 'Champion calls'
    }
    else if (item === 'coachCalls') {
      return 'Coachable Calls'
    }
  }

}
