import { SelectionModel } from '@angular/cdk/collections';
import { RecordingDetails } from 'src/app/_services/recordingDetails';
import {
  Component,
  OnInit,
  ViewChild,
  Input,
  OnDestroy,
  Output,
  EventEmitter,
  ChangeDetectorRef, AfterContentChecked,
  OnChanges,
  SimpleChanges,
  ElementRef,
  Injectable,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Observable } from 'rxjs';
import * as moment from 'moment';

import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatSort, Sort } from '@angular/material/sort';
import { RecordingLists } from 'src/app/_services/recordingList';
import { FormControl, FormGroup } from '@angular/forms';

import { DaterangepickerDirective } from 'ngx-daterangepicker-material';
import { LocationStrategy } from '@angular/common';
import { ModalDismissReasons, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';


import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';

interface FoodNode {
  name: string;
  children?: FoodNode[];
}

let TREE_DATA = [
];

/** Flat node with expandable and level information */
interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

export class TodoItemNode {
  children: TodoItemNode[];
  item: string;
}

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
  item: string;
  level: number;
  expandable: boolean;
  code?: string
}



export interface PeriodicElement {
  name?: string;
  src?: string;
  weight?: number;
  status?: string;
  imgPlay?: any;
  imgPause?: any;
  id?: string;
  agent?: string;
  isDownloadable?: boolean;
  isShare?: boolean;
  isDetail?: boolean;
  date?: string;
  group?: string
  scoring?: string
}

@Component({
  selector: 'app-recordings-table',
  templateUrl: './recordings-table.component.html',
  styleUrls: ['./recordings-table.component.scss'],
  // providers: [ChecklistDatabase],
  // encapsulation: ViewEncapsulation.None,
})

export class RecordingsTableComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('target', { static: false }) target: ElementRef;
  @ViewChild('check') private check;
  @Output() isAnySelected = new EventEmitter();
  @Output() onRefreshList = new EventEmitter();
  @Output() onApplyFilterRecList = new EventEmitter();


  @Input() closeSelection: boolean;
  @Input() filterScreen: boolean;
  @Input() searchedList: any;
  @Input() parentLoading: boolean;
  @Input() reloadList: boolean;
  @Input() onUpdateTags: any
  isRecordingDetail: boolean;
  @Input() get removeTagResponse(): any {
    return this._updateTags;
  }
  @Input() get agentList(): any {
    return this._agentSuggestList;
  }
  @Input() get recordingListArray(): any {
    return this._RecordingListResponce;
  }
  set removeTagResponse(e) {
    if (e) {
      this.ELEMENT_DATA.forEach(item => {
        if (item.id === e.id) {
          item.tags = e.tags;
        }
      })
    }
  }
  set agentList(e) {
    // console.log('Agent input',e)
    if (e) {
      this.groupsAndUsers = e;
      this.setAgentList();
    }
  }
  set recordingListArray(e) {
    if (e) {
      let groups : Array<any> = [...e.data?.call_titles]

      groups = groups.sort((a, b) => {
        return ('' + a).localeCompare(b)
      });
      // console.log(groups)
      this.CallTitlesuggestList = groups
      this.DuplicateCallTitlesuggestList = groups
    }
  }
  private _updateTags: any
  private _agentSuggestList: any
  private _RecordingListResponce: any
  duration: any = 0;
  currentTime = 50;
  readCurrentTime: string = '00:00';
  readDuration: string = '00:00';
  valume: any = 50;
  isPlay: boolean = false;
  playingId: string;
  muted: boolean = false;
  playerController?: boolean = false;
  isParentChecked: boolean = false;
  isEnabled: boolean = true;
  groupsAndUsers: any

  length = 500;
  pageSize = 7;
  pageIndex = 0;
  pageSizeOptions = [7, 6, 25];
  showFirstLastButtons = true;
  ELEMENT_DATA: PeriodicElement[] | any = [];

  handlePageEvent(event: PageEvent) {
    this.length = event.length;
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  mydata = {
    img: '',
    label: '',
    auther: ''
  };

  audio: any;
  @ViewChild(DaterangepickerDirective, { static: true })
  picker: DaterangepickerDirective;
  flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();
  nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();
  selectedParent: TodoItemFlatNode | null = null;
  newItemName = '';
  treeControl: FlatTreeControl<TodoItemFlatNode>;
  treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;
  dataSourceTree: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;
  checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);
  constructor(
    private cdref: ChangeDetectorRef,
    private _liveAnnouncer: LiveAnnouncer,
    private elm: ElementRef,
    private listOfRecording: RecordingLists,
    private Dser: RecordingDetails,
    private location: LocationStrategy,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    // private _database: ChecklistDatabase
  ) {
    this.audio = new Audio();
    history.pushState(null, null, window.location.href);
    // check if back or forward button is pressed.
    this.location.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });

  }
  ngOnInit(): void {
    this.checkDomain = window.location.hostname
    this.listOfRecording.changesStatus.subscribe((res: any) => {
      if (res) {
        if (this.isScoreChecked) {
          this.ELEMENT_DATA = this.ELEMENT_DATA.filter(data => {
            if (data.id !== res.id) {
              // data.scoring_status = res.status
              return data
            }
          })
          this.dataSource = new MatTableDataSource<PeriodicElement>(
            this.ELEMENT_DATA
          );
        } else {
          this.ELEMENT_DATA = this.ELEMENT_DATA.map(data => {
            if (data.id === res.id) {
              data.scoring_status = res.status
              return data
            }
          })
        }
      }
    })
    this.listOfRecording.isRecordingDetail.subscribe(res => {
      this.isRecordingDetail = res
    })
    this.listOfRecording.isRecordingDetail.next(false);
    this.selecteddateRangeMonth = moment().format('MMMM');
    this.selected = moment(new Date()).format('MM/DD/YY');
    this.selectedDouble = moment(new Date()).format('MM/DD/YY');
    this.testForm = new FormGroup({
      date: new FormControl(this.date)
    });
    this.testForm1 = new FormGroup({
      date1: new FormControl(this.date1)
    });
    let resData;
    this.listOfRecording.filterLists.subscribe(res => {
      if (res) {
        this.renderTable(res)
      }
      resData = res;
    });
    this.objFilter = { type: 'multiple' };
    let today = new Date();
    let lastweek = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - this.inTheLastValue
    );
    this.objFilter.start_date = moment(lastweek).format('MM/DD/YY');
    this.objFilter.end_date = moment(today).format('MM/DD/YY');
    this.objFilter.group_id = JSON.parse(localStorage.getItem('Selected_Group')) ? JSON.parse(localStorage.getItem('Selected_Group')) : 'all';
    console.log(this.objFilter);

    this.listOfRecording.FilterList(this.objFilter).subscribe(data => {
      if (resData) {
        this.ELEMENT_DATA = resData.data.recordings;
        this.totalHits = resData.data.hits;
        this.apiPageCount = resData.data.count;
        this.agentSortandFilter = [...this.ELEMENT_DATA];
        this.agentData = resData.data.agents;
        this.dataSource = new MatTableDataSource<PeriodicElement>(
          this.ELEMENT_DATA
        );
        this.isLoading = false;
        this.loadPagination(this.ELEMENT_DATA);
        this.agentSortandFilter = [...this.ELEMENT_DATA];
      } else {
        this.ELEMENT_DATA = data.data.recordings;
        this.originalList = data;
        this.setAgentList()
        let ArrayList = []
        console.log(data.data.tags);

        let groups : Array<any> = data.data.tags

        groups = groups.sort((a, b) => {
          return ('' + a).localeCompare(b)
        });
        this.TagssuggestList = groups;
        this.totalHits = data.data.hits;
        this.apiPageCount = data.data.count;
        this.agentSortandFilter = [...this.ELEMENT_DATA];
        this.agentData = data.data.agents;
        this.dataSource = new MatTableDataSource<PeriodicElement>(
          this.ELEMENT_DATA
        );
        this.isLoading = false;


        this.agentSortandFilter = [...this.ELEMENT_DATA];
        this.changeItemLength(this.itemLength);
        this.listOfRecording.isAudioAccess = data.data.user_access_audio;
        this.isAudioAccess = data.data.user_access_audio;
        console.log('data=======>', data);
      }
      this.route.queryParams
        .subscribe(params => {
          if (params.id) {
            this.rowClicked(params.id, '')
          }
        });
    });
    // TREE_DATA = JSON.parse(localStorage.getItem('groups'));
    // if(TREE_DATA){
    //   this.treeData = TREE_DATA;
    //   this._database.initialize();
    //   this.checkAll();
    //   this.getGroups();
    //   this.totalGroupSelected = this.newCurrentArr.length + ' Groups selected';
    // }
  }

  // filterRecordingList(){
  //   this.selecteddateRangeMonth  = moment().format('MMMM');
  //   this.selected = moment(new Date()).format('MM/DD/YY');
  //   this.selectedDouble = moment(new Date()).format('MM/DD/YY');
  //   this.testForm = new FormGroup({
  //     date: new FormControl(this.date)
  //   });
  //   this.testForm1 = new FormGroup({
  //     date1: new FormControl(this.date1)
  //   });
  //   let resData;
  //   this.listOfRecording.filterLists.subscribe(res => {
  //     if(res){
  //       this.renderTable(res)
  //     }
  //     resData = res;
  //   });
  //   this.objFilter = { type: 'multiple' };
  //   let today = new Date();
  //   let lastweek = new Date(
  //     today.getFullYear(),
  //     today.getMonth(),
  //     today.getDate() - this.inTheLastValue
  //   );
  //   this.objFilter.start_date = moment(lastweek).format('MM/DD/YY');
  //   this.objFilter.end_date = moment(today).format('MM/DD/YY');
  //   this.objFilter.group_id = JSON.parse(localStorage.getItem('Selected_Group'));
  //   console.log(this.objFilter);

  //     this.listOfRecording.FilterList(this.objFilter).subscribe(data => {
  //       if (resData) {
  //         this.ELEMENT_DATA = resData.data.recordings;
  //         this.totalHits = resData.data.hits;
  //         this.apiPageCount = resData.data.count;
  //         this.agentSortandFilter = [...this.ELEMENT_DATA];
  //         this.agentData = resData.data.agents;
  //         this.dataSource = new MatTableDataSource<PeriodicElement>(
  //           this.ELEMENT_DATA
  //         );
  //         this.isLoading = false;
  //         this.loadPagination(this.ELEMENT_DATA);
  //         this.agentSortandFilter = [...this.ELEMENT_DATA];
  //       } else {
  //         this.ELEMENT_DATA = data.data.recordings;
  //         this.originalList = data;
  //         this.setAgentList()
  //         this.TagssuggestList = data.data.tags;
  //         this.totalHits = data.data.hits;
  //         this.apiPageCount = data.data.count;
  //         this.agentSortandFilter = [...this.ELEMENT_DATA];
  //         this.agentData = data.data.agents;
  //         this.dataSource = new MatTableDataSource<PeriodicElement>(
  //           this.ELEMENT_DATA
  //         );
  //         this.isLoading = false;


  //         this.agentSortandFilter = [...this.ELEMENT_DATA];
  //         this.changeItemLength(this.itemLength);
  //         this.listOfRecording.isAudioAccess = data.data.user_access_audio;
  //         this.isAudioAccess = data.data.user_access_audio;
  //         console.log('data=======>', data);
  //       }
  //       this.route.queryParams
  //   .subscribe(params => {
  //     if(params.id){
  //         this.rowClicked(params.id, '')
  //     }
  //   });
  //     });

  // }
  options: any = {
    autoApply: false,
    alwaysShowCalendars: false,
    showCancel: false,
    showClearButton: true,
    linkedCalendars: true,
    singleDatePicker: false,
    showWeekNumbers: false,
    showISOWeekNumbers: false,
    customRangeDirection: true,
    lockStartDate: false,
    closeOnAutoApply: true
  };

  selected: any;
  selectedDouble: any;
  calCount1 = 1;
  change(data) {
    // console.log(data)
    // console.log('this.selectedTime',this.selectedTime,this.isInLastStatus)
    let date = moment(data.startDate?._d).format('MM/DD/YY');
    if (data.startDate !== null) {
      this.selectedTime = date;
    }
    if (data.startDate == null && this.calCount1 == 1) {
      this.selectedTime = '';
    }
    this.calCount1++;
  }
  calCount = 1;
  changedouble(e) {
    // console.log('CallCount',this.calCount)
    // console.log('EEE',e)
    let date1 = moment(e.startDate?._d).format('MM/DD/YY');
    let date2 = moment(e.endDate?._d).format('MM/DD/YY');
    if (e.startDate !== null) {
      this.selectedTime = date1 + ' - ' + date2;
    }
    if (e.startDate == null && e.endDate == null && this.calCount == 1) {
      this.selectedTime = '';
    }
    this.calCount++;
  }
  openCal() {
    this.picker.open();
  }
  setAgentList() {
    // let root : string = this.treeControl.dataNodes[0]?.item
    this.AgentsuggestList = [];
    for (let item in this.groupsAndUsers) {
      if (this.newCurrentArr.find(i => i === item)) {
        this.AgentsuggestList.push(...this.groupsAndUsers[item]);
      }
    }

    this.duplicateAgentSuggestList = [...this.AgentsuggestList]
  }
  @ViewChild(MatSort) sort: MatSort;
  masterCheckbox: any;
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.masterCheckbox = this.elm.nativeElement.querySelector(
      '#masterToggler'
    );
    this.groupList = JSON.parse(localStorage.getItem('groups'))
  }
  /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
  agentUniqueList: any;
  statusUniqueList: any;

  isLoading: boolean = true;
  agentData: any;
  totalHits: number;
  apiPageCount: number;
  originalList: any;
  groupList = [];
  checkDomain: string = ''
  isAudioAccess: boolean = false;

  setDate(e) {
    if (e === 'single') {
      setTimeout(() => {
        this.selected = moment(new Date()).format('MM/DD/YY');
        this.selectedTime = this.selected
      }, 50);
    } else {
      setTimeout(() => {
        this.selectedDouble = moment(new Date()).format('MM/DD/YY');
        this.selectedDouble = this.selectedDouble + ' - ' + this.selectedDouble;
        this.selectedTime = this.selectedDouble
      }, 50);
    }
  }
  renderTable(resData) {
    this.ELEMENT_DATA = resData.data.recordings;
    this.totalHits = resData.data.hits;
    this.apiPageCount = resData.data.count;
    this.agentSortandFilter = [...this.ELEMENT_DATA];
    this.agentData = resData.data.agents;
    this.dataSource = new MatTableDataSource<PeriodicElement>(
      this.ELEMENT_DATA
    );
    this.isLoading = false;
    this.loadPagination(this.ELEMENT_DATA);
    this.agentSortandFilter = [...this.ELEMENT_DATA];
  }
  setMonth() {
    this.selectedTime = moment().format('MMMM');
  }
  uniqueAgents() {
    this.agentUniqueList = [
      ...new Set([...this.ELEMENT_DATA].map(data => data.agent))
    ];
    this.agentUniqueList = this.agentUniqueList.map(_data => {
      return { data: _data, isChecked: false };
    });
  }
  uniqueStatuses() {
    // this.statusUniqueList = [
    //   ...new Set([...this.ELEMENT_DATA].map((data) => data.status)),
    // ];
    // this.statusUniqueList = this.statusUniqueList.map((_data) => {
    //   return { data: _data, isChecked: false };
    // });
    this.statusUniqueList = [
      { data: 'Transcribed', isChecked: false },
      { data: 'Error', isChecked: false },
      { data: 'Analyzed', isChecked: false },
      { data: 'Pending', isChecked: false }
    ];
  }
  onSearchAgent(e: string) {
    let searchedAgent: Array<any>;
    if (e) {
      searchedAgent = [...this.agentUniqueList].filter(data => {
        let agent = data?.data?.toLowerCase();
        return agent?.includes(e.toLowerCase()) ? data : null;
      });
    }
    if (searchedAgent) {
      this.agentUniqueList = searchedAgent;
    } else {
      this.uniqueAgents();
    }
  }
  iconClicked() {
    alert('Icon Clicked');
  }
  dateClicked() {
    alert('Icon Clicked');
  }
  statusDropDown() {
    alert('Dropdown Clicked');
  }
  playAudio: any;
  sendData(element): void {
    this.isPlay = true;
    this.playerController = true;
    this.playingId = element.id;
    this.playAudio = {
      data: element.recording,
      isPlay: this.isPlay,
      Name: element.name,
      AgentName: element.agent
    };
  }
  togglePlaying(e) {
    this.isPlay = e;
  }

  playStreaming(data) {
    return new Observable(observer => {
      this.audio.src = data;
      this.audio.play();

      const handle = (events: Event) => {
        this.currentTime = this.audio.currentTime;
        this.readCurrentTime = this.formateTime(this.currentTime);
        this.duration = this.audio.duration;
        this.readDuration = this.formateTime(this.duration);

        observer.next(events);
      };
      // this.addEvents(this.audio, handle);
      this.audio.addEventListener('ended', handle);
      this.audio.addEventListener('error', handle);
      this.audio.addEventListener('play', handle);
      this.audio.addEventListener('playing', handle);
      this.audio.addEventListener('timeupdate', handle);
      this.audio.addEventListener('canplay', handle);
      this.audio.addEventListener('loadedmetadata', handle);
      this.audio.addEventListener('loadstart', handle);
    });
  }

  formateTime(time, formate = 'mm:ss') {
    const momentTime = time * 1000;
    return moment.utc(momentTime).format(formate);
  }

  setSeek(value) {
    this.audio.currentTime = value;
  }

  isStart() {
    return true;
  }

  setVolume(value) {
    this.audio.volume = value;
    this.muted = false;
  }
  mute() {
    this.audio.volume = 0;
    this.muted = true;
  }
  Unmute() {
    this.audio.volume = 1;
    this.muted = false;
  }
  previous() { }

  pause() {
    this.audio.pause();
    this.isPlay = false;
    this.playAudio = { data: '', isPlay: this.isPlay };
  }

  next() {
    this.audio.next();
  }
  rowClicked(userID, groupName) {
    let id = userID.replace('/', '~-~');
    localStorage.setItem('uId', id);
    this.Dser.id = id;
    this.pause();
    this.playerController = false;
    // this.router.navigateByUrl('/admin/recordings/recording-list');
    this.listOfRecording.isRecordingDetail.next(true);
  }

  play() {
    this.audio.play();
    this.isPlay = true;
  }
  stop() { }
  isEnd() {
    return false;
  }
  displayedColumns: string[] = [
    'select',
    'src',
    'name',
    'call_title',
    'groups',
    'agent',
    'weight',
    'symbol',
    'status',
    // 'scoring',
    'total_score',
    'icons',
  ];
  selectingTextZ(e: Event) {
    e.preventDefault();
  }
  ngOnChanges(changes: SimpleChanges) {
    // console.log('changes', changes)
    if (
      changes.reloadList?.currentValue !== changes.reloadList?.previousValue &&
      !changes.reloadList?.firstChange
    ) {
      this.unselectedRec();
      if (changes.onUpdateTags?.currentValue) {
        this.afterTag(changes.onUpdateTags.currentValue.ids, changes.onUpdateTags.currentValue.tags);
      }
    }

    if (changes.searchedList?.currentValue) {
      this.ELEMENT_DATA = this.searchedList?.data.recordings;
      this.totalHits = this.searchedList.data.hits;
      this.apiPageCount = this.searchedList.data.count;
      this.agentSortandFilter = this.ELEMENT_DATA;
      this.agentData = this.searchedList.data.agents;
      this.dataSource = new MatTableDataSource<PeriodicElement>(
        this.ELEMENT_DATA
      );
      this.isLoading = false

      this.loadPagination(this.ELEMENT_DATA);
      this.agentSortandFilter = [...this.ELEMENT_DATA];
      this.changeItemLength(this.itemLength);
    } else {
      if (this.originalList) {
        this.ELEMENT_DATA = this.originalList?.data.recordings;
        this.totalHits = this.originalList?.data.hits;
        this.apiPageCount = this.originalList.data.count;
        this.agentSortandFilter = this.ELEMENT_DATA;
        this.agentData = this.originalList?.data.agents;
        this.dataSource = new MatTableDataSource<PeriodicElement>(
          this.ELEMENT_DATA
        );
        this.isLoading = false;

        this.loadPagination(this.ELEMENT_DATA);
        this.agentSortandFilter = [...this.ELEMENT_DATA];
        this.changeItemLength(this.itemLength);
      }
    }
    if (changes.closeSelection) {
      if (this.check !== undefined) {
        this.check.checked = false;
      }
      this.selection.clear();
      this.selectedRowsList = [];
      this.isAnySelected.emit({
        isSelected: false,
        length: 0,
        selectedRows: []
      });
      this.selectedRowsList.length = 0;
    }
    if (changes.parentLoading?.currentValue) {
      this.isLoading = true;
    } else if (!changes.parentLoading?.firstChange) {
      setTimeout(() => {
        this.isLoading = false;
      }, 1500);

    }
  }
  // after tag added
  afterTag(ids, tags) {
    this.TagssuggestList.push(...tags)
    ids.forEach(res => {
      this.ELEMENT_DATA = this.ELEMENT_DATA.map(data => {
        if (data.id === res) {
          data.tags.push(...tags);
          data.tags = [...new Set(data.tags)]
        }
        return data
      })
    });

  }
  dataSource = new MatTableDataSource<PeriodicElement>(this.ELEMENT_DATA);
  selection = new SelectionModel<PeriodicElement>(true, []);

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.ELEMENT_DATA.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.ELEMENT_DATA);
  }

  /** The label for the checkbox on the passed row */
  stopPropagation(row?: PeriodicElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'
      } row ${row.src + 1}`;
  }
  selectedRowsList = [];
  isRowSelected(e, row: any) {
    if (
      this.statusTags.length === 0 &&
      this.agentTags.length == 0 &&
      this.moreThan == '' &&
      this.lessThan == '' &&
      this.dateTag == ''
    ) {
      if (e.checked) {
        this.selectedRowsList.push(row);
        if (this.selection.selected.length + 1 === this.ELEMENT_DATA.length) {
          this.check.checked = true;
        }
      } else {
        this.check.checked = false;
        this.selectedRowsList = this.selectedRowsList.filter(item => {
          return row.id === item.id ? false : true;
        });
      }
      this.isAnySelected.emit({
        isSelected: this.selectedRowsList.length > 0 ? true : false,
        length: this.selectedRowsList.length,
        selectedRows: this.selectedRowsList
      });
    } else {
      if (e.checked) {
        this.selectedRowsList.push(row);
        if (
          this.selection.selected.length + 1 ===
          this.agentSortandFilter.length
        ) {
          this.check.checked = true;
        }
      } else {
        this.check.checked = false;
        this.selectedRowsList = this.selectedRowsList.filter(item => {
          return row.id === item.id ? false : true;
        });
      }
      this.isAnySelected.emit({
        isSelected: this.selectedRowsList.length > 0 ? true : false,
        length: this.selectedRowsList.length,
        selectedRows: this.selectedRowsList
      });
    }
  }
  TransformVal(i) {
    return 'p' + Math.ceil(i);
  }
  isAllRowSelected(e) {
    // alertthis.isAllSelected());
    if (
      this.statusTags.length === 0 &&
      this.agentTags.length == 0 &&
      this.moreThan == '' &&
      this.lessThan == '' &&
      this.dateTag == ''
    ) {
      if (this.isAllSelected()) {
        this.selection.clear();
      } else {
        this.selection.select(...this.ELEMENT_DATA);
      }
      if (this.check.checked) {
        this.selectedRowsList = this.ELEMENT_DATA;
        this.isAnySelected.emit({
          isSelected: true,
          length: this.ELEMENT_DATA.length,
          selectedRows: this.ELEMENT_DATA
        });
      } else {
        this.check.checked = false;
        this.selectedRowsList = [];
        this.isAnySelected.emit({
          isSelected: false,
          length: 0,
          selectedRows: []
        });
        this.selectedRowsList.length = 0;
      }
    } else {
      if (this.selection.selected.length === this.agentSortandFilter.length) {
        this.selection.clear();
      } else {
        this.selection.select(...this.agentSortandFilter);
      }
      if (this.check.checked) {
        this.selectedRowsList = this.agentSortandFilter;
        this.isAnySelected.emit({
          isSelected: true,
          length: this.agentSortandFilter.length
        });
      } else {
        this.check.checked = false;
        this.selectedRowsList = [];
        this.isAnySelected.emit({
          isSelected: false,
          length: 0,
          selectedRows: []
        });
        this.selectedRowsList.length = 0;
      }
    }
  }
  unselectedRec() {
    this.check.checked = false;
    this.selection.deselect(...this.ELEMENT_DATA)
    this.selectedRowsList = [];
    this.isAnySelected.emit({ isSelected: false, length: 0, selectedRows: [] });
    this.selectedRowsList.length = 0;
  }
  onClose(e) {
    this.playerController = e;
    this.isPlay = false;
  }
  iconClickedColor = true;
  agentIcon = '';
  agentFilterActive = false;

  // statusFilterActive = false;
  // statusIcon = '';
  // statusFilter() {
  //   this.statusFilterActive = !this.statusFilterActive;
  //   if (this.statusIcon !== 'onClick') {
  //     this.statusIcon = 'onClick';
  //   } else {
  //     this.statusIcon = ''
  //   }
  // }

  agentAcs = false;
  agentNone = true;
  agentDcs = false;
  agentChecked = false;
  agentFilter() {
    if (this.agentIcon !== 'onClick') {
      this.agentIcon = 'onClick';
    } else {
      this.agentIcon = '';
    }
    this.agentFilterActive = !this.agentFilterActive;
  }
  agentFilter1() {
    this.agentFilterActive = !this.agentFilterActive;
  }
  status = 'none';
  isSortingStatus: string = 'none';
  agentSortandFilter: any = [...this.ELEMENT_DATA];
  agentFilterOn: boolean = false;

  onNoneSorting() {
    this.agentSortandFilter = [...this.ELEMENT_DATA];
    this.agentIcon = '';
  }

  onApply() {
    if (this.isSortingStatus == 'acs') {
      this.onAscending();
      this.dataSource = new MatTableDataSource<PeriodicElement>(
        this.agentSortandFilter
      );
    } else if (this.isSortingStatus == 'dcs') {
      this.onDscending();
      this.dataSource = new MatTableDataSource<PeriodicElement>(
        this.agentSortandFilter
      );
    } else if (
      this.isSortingStatus == 'none' &&
      this.agentSortandFilter.length === this.ELEMENT_DATA.length
    ) {
      // this.dataSource = new MatTableDataSource<PeriodicElement>(
      //   this.ELEMENT_DATA
      // );
    } else {
      this.dataSource = new MatTableDataSource<PeriodicElement>(
        this.agentSortandFilter
      );
    }
    if (this.status === 'checked') {
      this.showAgentFilteringTags();
    }
    this.agentIcon = '';
    this.agentFilterActive = false;
    // this.changeItemLength(this.itemLength);
    if (this.agentSortandFilter.length > 0) {
      this.changeItemLength(this.itemLength);
    }
  }
  sorting(val) {
    this.agentNone = false;
    this.agentAcs = false;
    this.agentDcs = false;
    this.agentChecked = false;

    if (val === 'none') {
      this.agentNone = true;
    } else if (val === 'acs') {
      this.agentAcs = true;
    } else if (val === 'dcs') {
      this.agentDcs = true;
    } else if (val === 'checked') {
      this.agentChecked = true;
    }
  }
  duplicatList = [];
  onChangeDemo(e, agent: string) {
    this.status = 'checked';
    if (e.checked) {
      let dups = this.ELEMENT_DATA.filter(data => data?.agent?.includes(agent));
      this.duplicatList.push(...dups);
    } else {
      this.duplicatList = this.duplicatList.filter(data => {
        return data?.agent === agent ? false : true;
      });
    }
    this.agentSortandFilter = this.duplicatList;
    if (this.agentSortandFilter.length === 0) {
      this.agentSortandFilter = [...this.ELEMENT_DATA];
    }
  }
  agentTags = [];
  showAgentFilteringTags() {
    this.agentTags = [...new Set(this.duplicatList.map(data => data.agent))];
  }
  clearSelection() {
    this.check.checked = false;
    this.selectedRowsList = [];
    this.selection.clear();
    this.isAnySelected.emit({
      isSelected: false,
      length: this.selectedRowsList.length
    });
  }
  validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
  }
  onClear(e) {
    this.clearSelection();
    // reset agent filter and icons
    // agentTags moreThan lessThan dateTag statusTags

    if (e === 'agent') {
      this.agentFilterActive = false;
      this.agentIcon = '';
      this.agentNone = true;
      this.agentAcs = false;
      this.agentDcs = false;
      this.agentChecked = false;
      this.uniqueAgents();
      this.duplicatList.length = 0;
      this.agentTags.length = 0;
    }
    // reset duration filter and icons
    if (e === 'duration') {
      this.durationFilterIcon = false;
      this.durationFilterActive = false;
      this.durationIcon = '';
      this.showFilterColor('none');
      this.moreThan = '';
      this.lessThan = '';
      this.moreThanLimit = '';
      this.lessThanLimit = '';
      this.moretimeFormat = 'seconds';
      this.lesstimeFormat = 'seconds';
      this.durationStr = '';
      this.durationOrder = false;
    }
    // reset date filter and icons
    if (e === 'date') {
      this.dateFilterIcon = false;
      this.dateIcon = '';
      this.showDateFilterColor('none');
      this.dateTag = '';
      this.fromDate = '';
      this.tillDate = '';
      this.currentZone = 'CST';
      this.datefilterTag = '';
      this.testForm = new FormGroup({
        date: new FormControl('')
      });
      this.testForm1 = new FormGroup({
        date1: new FormControl('')
      });
      this.radioChecked = -1;
      this.dateFilterIcon = true;
      this.mydateStatus = 'none';
    }
    // reset status filter and icons
    if (e === 'status') {
      this.statusStatus = false;
      this.statusFilterIcon = false;
      this.statusIcon = '';
      this.showStatusFilterColor('none');
      this.uniqueStatuses();
      this.statusDuplicatesList.length = 0;
      this.isStatusTagActive = false;
      this.statusTags.length = 0;
    }

    // reset Pagination
    this.agentSortandFilter = [...this.ELEMENT_DATA];

    if (this.statusTags.length > 0) {
      this.statusTags.forEach(d => {
        this.agentSortandFilter = this.agentSortandFilter.filter(
          data => d.data === data.status
        );
      });
    } else if (this.agentTags.length > 0) {
      // this.onApply();
      this.agentTags.forEach(d => {
        this.agentSortandFilter = this.agentSortandFilter.filter(
          data => d === data.agent
        );
      });
    } else {
      this.agentSortandFilter = [...this.ELEMENT_DATA];
    }
    // this.loadPagination(this.ELEMENT_DATA);
    // this.onApply();
    this.durationApply();
    this.dateApply();
    // this.statusApply();
  }

  // Duration Dropdown
  durationIcon = '';
  durationSort: any;
  durationOrder = false;
  durationStr = '';
  durationStatus: boolean = false;
  durationFilterIcon: boolean = false;
  durationFilterActive = false;
  moreThanLimit: string = '';
  lessThanLimit: string = '';
  moretimeFormat: string = 'seconds';
  lesstimeFormat: string = 'seconds';

  moreThan: string = '';
  lessThan: string = '';
  // vars that show the active sorting status
  onClickNone: boolean = true;
  onClickAcs: boolean = false;
  onClickDcs: boolean = false;

  DurationFilter() {
    if (this.durationIcon !== 'onClick') {
      this.durationIcon = 'onClick';
    } else {
      this.durationIcon = '';
    }
  }

  transform(ad: any): string {
    let audioTime = Math.floor(ad);
    let audioLengthMin = ('0' + Math.floor(audioTime / 60)).slice(-2);
    let audioLengthSec = ('0' + (audioTime % 60)).slice(-2);
    return Number(audioLengthMin) < 59
      ? `00:${audioLengthMin}:${audioLengthSec}`
      : '';
  }

  durationAcs(): void {
    this.durationOrder = true;
    this.durationStr = 'acs';
  }
  durationDcs(): void {
    this.durationOrder = true;
    this.durationStr = 'dcs';
  }


  durationApply() {
    this.moreThan = this.moreThanLimit;
    this.lessThan = this.lessThanLimit;

    if (this.durationOrder && (this.moreThan || this.lessThan)) {
      this.durationFilterApply();
      this.newSortDuration(this.durationStr);
      this.dataSource = new MatTableDataSource<PeriodicElement>(
        this.agentSortandFilter
      );
      this.durationFilterIcon = true;
    } else if (this.durationOrder) {
      this.newSortDuration(this.durationStr);
      this.dataSource = new MatTableDataSource<PeriodicElement>(
        this.agentSortandFilter
      );
      this.durationFilterIcon = true;
    } else if (this.moreThan || this.lessThan) {
      this.durationFilterApply();
      this.durationFilterIcon = true;
    } else {
      this.dataSource = new MatTableDataSource<PeriodicElement>(
        this.ELEMENT_DATA
      );
      this.durationFilterIcon = false;
      this.durationFilterActive = false;
      this.durationIcon = '';
      this.onClickNone = true;
    }
    // this.changeItemLength(this.itemLength);
    if (this.agentSortandFilter.length > 0) {
      this.changeItemLength(this.itemLength);
    }
  }
  durationFilterApply() {
    let moreSec: any = 0;
    let lessSec: any = 0;
    if (this.moretimeFormat === 'hours') {
      moreSec = Number(this.moreThanLimit) * 60 * 60;
    } else if (this.moretimeFormat === 'minutes') {
      moreSec = Number(this.moreThanLimit) * 60;
    } else {
      moreSec = Number(this.moreThanLimit);
    }
    if (this.lesstimeFormat === 'hours') {
      lessSec = Number(this.lessThanLimit) * 60 * 60;
    } else if (this.lesstimeFormat === 'minutes') {
      lessSec = Number(this.lessThanLimit) * 60;
    } else {
      lessSec = Number(this.lessThanLimit);
    }
    if (this.moreThan && this.lessThan) {
      this.agentSortandFilter = this.agentSortandFilter.filter(data => {
        return data.weight > moreSec && data.weight < lessSec;
      });
      this.dataSource = new MatTableDataSource<PeriodicElement>(
        this.agentSortandFilter
      );
      return;
    } else if (this.moreThan) {
      this.agentSortandFilter = this.agentSortandFilter.filter(data => {
        return data.weight > moreSec;
      });
      this.dataSource = new MatTableDataSource<PeriodicElement>(
        this.agentSortandFilter
      );
      return;
    } else if (this.lessThan) {
      this.agentSortandFilter = this.agentSortandFilter.filter(data => {
        return data.weight < lessSec;
      });
      this.dataSource = new MatTableDataSource<PeriodicElement>(
        this.agentSortandFilter
      );
      return;
    }
  }
  showFilterColor(val) {
    this.onClickNone = false;
    this.onClickAcs = false;
    this.onClickDcs = false;
    if (val === 'acs') {
      this.onClickAcs = true;
    } else if (val === 'dcs') {
      this.onClickDcs = true;
    } else {
      this.onClickNone = true;
    }
  }

  durationNone() {
    this.durationStatus = false;
  }

  duratinoMoreThan(val) {
    this.moreThanLimit = val;
  }
  duratinoLessThan(val) {
    this.lessThanLimit = val;
  }
  timeMoreThan(val) {
    this.isDurationDropdown1 = false;
    this.moretimeFormat = val;
  }
  timeLessThan(val) {
    this.isDurationDropdown2 = false;
    this.lesstimeFormat = val;
  }

  clearDurationFilter() {
    this.durationApply();
    this.durationFilterIcon = false;
    this.durationFilterActive = false;
    this.durationIcon = '';
    this.showFilterColor('none');
    this.moreThan = '';
    this.lessThan = '';
    this.moreThanLimit = '';
    this.lessThanLimit = '';
  }

  // Date Filter Dropdown

  dateSort = [...this.ELEMENT_DATA];
  dateStatus: boolean = false;
  dateFilterIcon: boolean = false;
  datefilterActive = true;
  dateIcon = '';
  dateFilterActive = false;
  fromDate: string = '';
  tillDate: string = '';
  currentZone = 'GMT';
  dateTag = '';
  date: any;
  date1: any;
  testForm: FormGroup;
  testForm1: FormGroup;
  radioChecked = -1;
  mydateStatus = 'none';

  // vars that show the active sorting status
  onClickdateNone: boolean = true;
  onClickdateAcs: boolean = false;
  onClickdateDcs: boolean = false;

  dateFilter() {
    this.dateFilterActive = !this.dateFilterActive;
    if (this.dateIcon !== 'onClick') {
      this.dateIcon = 'onClick';
    } else {
      this.dateIcon = '';
    }
  }

  dateNone() {
    this.dateStatus = false;
  }


  dateApply() {
    this.dateIcon = '';
    this.dateFilterIcon = false;
    if (this.datefilterTag) {
      if (this.datefilterTag === 'Period') {
        this.dataFilterApply();
        if (this.agentSortandFilter.length > 0) {
          this.changeItemLength(this.itemLength);
        }
        return;
      } else if (this.datefilterTag === 'Last Week') {
        this.filterLastWeek();
        this.dateTag = this.datefilterTag;
      } else if (this.datefilterTag === 'Last Month') {
        this.filterLastMonth();
        this.dateTag = this.datefilterTag;
      } else if (this.datefilterTag === 'Last Year') {
        this.filterLastYear();
        this.dateTag = this.datefilterTag;
      }
      this.dateFilterIcon = true;
      if (this.agentSortandFilter.length > 0) {
        this.changeItemLength(this.itemLength);
      }
      if (this.agentSortandFilter.length > 0) {
        this.changeItemLength(this.itemLength);
      }
      return;
    }
    if (this.mydateStatus === 'acs' || this.mydateStatus === 'dcs') {
      this.dateFilterIcon = true;
      this.dataSource = new MatTableDataSource<PeriodicElement>(
        this.agentSortandFilter
      );
    } else if ((this.dateTag = '' && this.mydateStatus === 'none')) {
      this.onClear('date');
    }
  }

  filterLastWeek() {
    let today = new Date();
    let firstDayOfTheWeek = today.getDate() - today.getDay() + 1;
    let lastDayOfTheWeek = firstDayOfTheWeek + 6;
    let firstDayOfLastWeek = new Date(today.setDate(firstDayOfTheWeek - 7));
    let lastDayOfLastWeek = new Date(today.setDate(lastDayOfTheWeek - 7));
    let sortingAndFilter = this.agentSortandFilter.filter(d => {
      let date = new Date(d?.date?.slice(0, 8));
      return date >= firstDayOfLastWeek && date <= lastDayOfLastWeek;
    });
    this.agentSortandFilter = sortingAndFilter;
    this.dataSource = new MatTableDataSource<PeriodicElement>(
      this.agentSortandFilter
    );
  }

  filterLastMonth() {
    let today = new Date();
    let startMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    var lastday = function (y, m) {
      return new Date(y, m + 1, 0).getDate();
    };
    let endMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      lastday(today.getFullYear(), today.getMonth() - 1)
    );
    let sortingAndFilter = this.agentSortandFilter.filter(d => {
      let date: any = new Date(d?.date?.slice(0, 8));
      return date >= startMonth && date <= endMonth;
    });
    this.agentSortandFilter = sortingAndFilter;
    this.dataSource = new MatTableDataSource<PeriodicElement>(
      this.agentSortandFilter
    );
  }

  filterLastYear() {
    let today = new Date();
    let startYear = new Date(today.getFullYear() - 1, 0, 1);
    let endYear = new Date(today.getFullYear() - 1, 11, 31);
    let sortingAndFilter = this.agentSortandFilter.filter(d => {
      let date: any = new Date(d?.date?.slice(0, 8));
      return date >= startYear && date <= endYear;
    });
    this.agentSortandFilter = sortingAndFilter;
    this.dataSource = new MatTableDataSource<PeriodicElement>(
      this.agentSortandFilter
    );
  }
  dataFilterApply() {
    this.dateTag = this.fromDate + ' - ' + this.tillDate;
    if (this.dateTag == ' - ') {
      this.dateTag = '';
      return;
    }
    this.dateFilterIcon = true;
    if (this.fromDate && this.tillDate) {
      let from: any = new Date(String(this.fromDate));
      let till: any = new Date(String(this.tillDate));

      let sortingAndFilter = this.agentSortandFilter.filter(elm => {
        let date: any = new Date(elm?.date?.slice(0, 8));
        return from < date && till > date;
      });
      this.agentSortandFilter = sortingAndFilter;
      this.dataSource = new MatTableDataSource<PeriodicElement>(
        this.agentSortandFilter
      );
    }
  }

  showDateFilterColor(val) {
    this.onClickdateNone = false;
    this.onClickdateAcs = false;
    this.onClickdateDcs = false;
    if (val === 'acs') {
      this.onClickdateAcs = true;
    } else if (val === 'dcs') {
      this.onClickdateDcs = true;
    } else {
      this.onClickdateNone = true;
    }
  }
  datefilterTag = '';
  // Last Week, Last Month, Last Year

  dateRadioChange(e) {
    this.datefilterTag = e;
    if (e === 'Last Week') {
      let today = new Date();
      let firstDayOfTheWeek = today.getDate() - today.getDay() + 1;
      let lastDayOfTheWeek = firstDayOfTheWeek + 6;
      let firstDayOfLastWeek = new Date(today.setDate(firstDayOfTheWeek - 7));
      let lastDayOfLastWeek = new Date(today.setDate(lastDayOfTheWeek - 7));
      this.testForm = new FormGroup({
        date: new FormControl(firstDayOfLastWeek)
      });
      this.testForm1 = new FormGroup({
        date1: new FormControl(lastDayOfLastWeek)
      });
    } else if (e === 'Last Month') {
      let today = new Date();
      let startMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      var lastday = function (y, m) {
        return new Date(y, m + 1, 0).getDate();
      };
      let endMonth = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        lastday(today.getFullYear(), today.getMonth() - 1)
      );
      this.testForm = new FormGroup({
        date: new FormControl(startMonth)
      });
      this.testForm1 = new FormGroup({
        date1: new FormControl(endMonth)
      });
    } else if (e === 'Last Year') {
      let today = new Date();
      let startYear = new Date(today.getFullYear() - 1, 0, 1);
      let endYear = new Date(today.getFullYear() - 1, 11, 31);
      this.testForm = new FormGroup({
        date: new FormControl(startYear)
      });
      this.testForm1 = new FormGroup({
        date1: new FormControl(endYear)
      });
    } else {
      this.testForm = new FormGroup({
        date: new FormControl('')
      });
      this.testForm1 = new FormGroup({
        date1: new FormControl('')
      });
    }
  }
  fromChangeDate(e) {
    this.fromDate = e;
  }
  tillChangeDate(e) {
    this.tillDate = e;
  }
  onChangeZone(e) {
    this.isDateDropdown = false;
    this.currentZone = e;
  }
  clearDateFilter() {
    this.dataSource = new MatTableDataSource<PeriodicElement>(
      this.ELEMENT_DATA
    );
    this.dateFilterIcon = false;
    this.dateIcon = '';
    this.showDateFilterColor('none');
    this.dateTag = '';
    this.fromDate = '';
    this.tillDate = '';
    this.currentZone = 'CST';
    this.datefilterTag = '';
  }

  // Status Filter Dropdown

  statusSort: any;
  statusStatus: boolean = false;
  statusFilterIcon: boolean = false;
  statusfilterActive = true;
  statusIcon = '';
  statusFilterActive = false;
  isStatusTagActive = false;
  mystatus = 'none';

  // vars that show the active sorting status
  onClickstatusNone: boolean = true;
  onClickstatusAcs: boolean = false;
  onClickstatusDcs: boolean = false;

  statusFilter() {
    this.statusFilterActive = !this.statusFilterActive;
    if (this.statusFilterActive) {
      this.disableScrolling();
    }
    if (this.statusIcon !== 'onClick') {
      this.statusIcon = 'onClick';
    } else {
      this.statusIcon = '';
    }
  }
  disableScrolling() {
    var x = window.scrollX;
    var y = window.scrollY;
    window.onscroll = function () {
      window.scrollTo(x, y);
    };
  }

  statusNone() {
    this.statusStatus = false;
    this.dataSource = new MatTableDataSource<PeriodicElement>(
      this.ELEMENT_DATA
    );
  }



  statusApply() {
    this.statusIcon = '';
    if (
      this.statusUniqueList.every(data => data.isChecked === false) &&
      this.agentTags.length == 0 &&
      this.moreThan == '' &&
      this.lessThan == '' &&
      this.dateTag == ''
    ) {
      this.agentSortandFilter = this.ELEMENT_DATA;
    }
    this.showStatusFilteringTags();
    if (this.statusTags.length > 0) {
      this.agentSortandFilter = this.statusDuplicatesList;
    }
    this.statusFilterIcon = true;
    this.isStatusTagActive = true;
    if (this.mystatus == 'acs') {
      this.statusAcs();
      this.dataSource = new MatTableDataSource<PeriodicElement>(
        this.agentSortandFilter
      );
      this.statusFilterIcon = true;
    } else if (this.mystatus == 'dcs') {
      this.statusDcs();
      this.dataSource = new MatTableDataSource<PeriodicElement>(
        this.agentSortandFilter
      );
      this.statusFilterIcon = true;
    } else {
      this.dataSource = new MatTableDataSource<PeriodicElement>(
        this.agentSortandFilter
      );
      this.statusFilterIcon = false;
      this.statusIcon = '';
      this.onClickstatusNone = true;
    }
    if (
      this.agentSortandFilter.length > 0 &&
      this.statusTags.length === 0 &&
      this.agentTags.length == 0 &&
      this.moreThan == '' &&
      this.lessThan == '' &&
      this.dateTag == ''
    ) {
      this.changeItemLength(this.itemLength);
    }
    if (this.agentSortandFilter.length > 0) {
      this.changeItemLength(this.itemLength);
    }
  }

  showStatusFilterColor(val) {
    this.onClickstatusNone = false;
    this.onClickstatusAcs = false;
    this.onClickstatusDcs = false;
    if (val === 'acs') {
      this.onClickstatusAcs = true;
    } else if (val === 'dcs') {
      this.onClickstatusDcs = true;
    } else {
      this.onClickstatusNone = true;
    }
  }
  statusDuplicatesList = [];
  onFilterStatus(e: any, _status: string) {
    let dups: any;
    if (e.checked) {
      if (
        this.agentTags.length == 0 &&
        this.moreThan == '' &&
        this.lessThan == '' &&
        this.dateTag == ''
      ) {
        dups = this.ELEMENT_DATA.filter(data => data.status.includes(_status));
      } else {
        dups = this.agentSortandFilter.filter(data =>
          data.status.includes(_status)
        );
      }
      this.statusDuplicatesList.push(...dups);
    } else {
      this.statusDuplicatesList = this.statusDuplicatesList.filter(data => {
        return data.status === _status ? false : true;
      });
    }
    this.statusStatus = true;
  }
  statusTags = [];
  showStatusFilteringTags() {
    // if(e.checked){
    //   this.statusTags.push(tags);
    //   this.statusTags = [...new Set(this.statusTags)]
    // }else{
    //   this.statusTags = this.statusTags.filter(tag =>{
    //     return tag === tags ? false : true;
    //   })
    // }
    this.statusTags = this.statusUniqueList.filter(data => data.isChecked);
  }
  clearStatusFilter() {
    this.dataSource = new MatTableDataSource<PeriodicElement>(
      this.ELEMENT_DATA
    );
    this.statusStatus = false;
    this.statusFilterIcon = false;
    this.statusIcon = '';
    this.showStatusFilterColor('none');
    this.uniqueStatuses();
    this.statusDuplicatesList.length = 0;
    this.isStatusTagActive = false;
    this.statusTags.length = 0;
  }

  // Pagination Section

  itemLength: number = 25;
  lowerLimit = 1;
  uppreLimit = 25;
  totalArraySize = 0;
  totalPageCounter = 1;
  currentPage = 1;
  newElementArray: any;
  newPageCounter: any
  loadPagination(e) {
    this.newElementArray = e;
    let el: any;
    if (e.length > 0) {
      el = e;
    } else {
      el = [...this.ELEMENT_DATA];
    }

    this.dataSource = new MatTableDataSource<PeriodicElement>(
      el.slice(this.lowerLimit - 1, this.uppreLimit)
    );
    this.totalArraySize = this.ELEMENT_DATA.length;
    this.totalPageCounter = Math.ceil(Math.abs(this.totalHits / this.itemLength));
    this.newPageCounter = Math.ceil(Math.abs(el.length / this.itemLength));
  }
  onNextPage() {
    this.elm.nativeElement.querySelector('#paginationInput').blur();
    let tar = this.elm.nativeElement.querySelector('#target');
    this.scrollToTop(tar);
    if (
      this.statusTags.length === 0 &&
      this.agentTags.length == 0 &&
      this.moreThan == '' &&
      this.lessThan == '' &&
      this.dateTag == '' &&
      this.currentPage == this.newPageCounter &&
      this.ELEMENT_DATA.length < this.totalHits
    ) {
      this.isLoading = true;
      let page = Number(this.apiPageCount) + 1;
      this.objFilter.count = page;
      this.objFilter.itemLength = this.itemLength;
      this.objFilter.totalItems = this.ELEMENT_DATA.length;
      this.listOfRecording.FilterList(this.objFilter).subscribe(data => {
        console.log('pagination payload=======>', data);
        delete this.objFilter.itemLength;
        delete this.objFilter.totalItems;
        let newData = data.data.recordings;
        this.ELEMENT_DATA.push(...newData);
        this.totalHits = data.data.hits;
        this.apiPageCount = data.data.count;
        this.agentSortandFilter = this.ELEMENT_DATA;
        this.agentData = data.data.agents;
        this.dataSource = new MatTableDataSource<PeriodicElement>(
          this.ELEMENT_DATA
        );
        this.isLoading = false;

        if (this.ELEMENT_DATA.length > this.itemLength) {
          this.lowerLimit += this.itemLength;
          this.uppreLimit += this.itemLength;
          this.currentPage++;
        }
        this.loadPagination(this.ELEMENT_DATA);
        this.uniqueAgents();
        this.uniqueStatuses();
        this.agentSortandFilter = [...this.ELEMENT_DATA];
        this.selectedRowsList = [];

        this.isAnySelected.emit({
          isSelected: false,
          length: 0,
          selectedRows: []
        });
        this.selectedRowsList.length = 0;
        this.selection.clear();
        let upperLim: any;
        upperLim = this.uppreLimit;
      });
    } else {
      let upperLim: any;
      upperLim = this.uppreLimit;
      this.lowerLimit += this.itemLength;
      this.uppreLimit += this.itemLength;
      this.currentPage++;
      if (
        this.uppreLimit > this.agentSortandFilter.length &&
        upperLim >= this.agentSortandFilter.length
      ) {
        this.lowerLimit -= this.itemLength;
        this.uppreLimit -= this.itemLength;
        this.currentPage--;
        return;
      }
      this.loadPagination(this.agentSortandFilter);
    }
  }
  onPrevPage() {
    this.elm.nativeElement.querySelector('#paginationInput').blur();
    let tar = this.elm.nativeElement.querySelector('#target');
    this.scrollToTop(tar);
    this.lowerLimit -= this.itemLength;
    this.uppreLimit -= this.itemLength;
    this.currentPage--;
    if (this.lowerLimit < 0) {
      this.currentPage++;
      this.lowerLimit += this.itemLength;
      this.uppreLimit += this.itemLength;
      return;
    }
    this.loadPagination(this.agentSortandFilter);
  }
  goTo(e) {
    this.elm.nativeElement.querySelector('#paginationInput').blur();
    let tar = this.elm.nativeElement.querySelector('#target');
    this.scrollToTop(tar);

    // this.scrollToTop(target)
    if (e <= this.totalPageCounter) {
      if (e < 1) {
        return
      }
      if (e == 1) {
        this.lowerLimit = 1;
        this.uppreLimit = this.itemLength;
        this.currentPage = 1;
        this.dataSource = new MatTableDataSource<PeriodicElement>(
          this.ELEMENT_DATA.slice(this.lowerLimit - 1, this.uppreLimit)
        );
        return;
      }
      let upper = this.itemLength * Number(e);
      let lower = upper - this.itemLength;
      if (lower >= this.ELEMENT_DATA.length) {
        return
      }
      if (
        this.statusTags.length === 0 &&
        this.agentTags.length == 0 &&
        this.moreThan == '' &&
        this.lessThan == '' &&
        this.dateTag == ''
      ) {
        this.dataSource = new MatTableDataSource<PeriodicElement>(
          [...this.ELEMENT_DATA].slice(lower, upper)
        );
        this.currentPage = e;
        this.lowerLimit = lower + 1;
        this.uppreLimit = upper;
      } else {
        this.dataSource = new MatTableDataSource<PeriodicElement>(
          [...this.agentSortandFilter].slice(lower, upper)
        );
        this.currentPage = e;
        this.lowerLimit = lower + 1;
        this.uppreLimit = upper;
      }
    }
  }
  getRemainingData(e) {
    console.log(this.objFilter);
    if (this.totalHits === this.ELEMENT_DATA.length) {
      this.totalPageCounter = 1;
      var numberDiv = Number(this.uppreLimit) > Number(this.ELEMENT_DATA.length) ? Number(this.ELEMENT_DATA.length) : Number(this.uppreLimit)
      let newPage = Math.ceil(numberDiv / Number(e))
      this.currentPage = newPage;
      this.uppreLimit = Number(newPage) * e;
      this.lowerLimit = Number(this.uppreLimit) - Number(e) + 1;
      this.loadPagination(this.ELEMENT_DATA);
      return
    }
    this.isLoading = true;
    this.listOfRecording.FilterList(this.objFilter).subscribe(data => {
      console.log('Remaing Items ----', data);
      delete this.objFilter.itemLength;
      delete this.objFilter.totalItems;
      let newData = data.data.recordings;
      this.ELEMENT_DATA.push(...newData);
      this.totalHits = data.data.hits;
      this.apiPageCount = data.data.count;
      this.agentSortandFilter = this.ELEMENT_DATA;
      this.agentData = data.data.agents;
      this.dataSource = new MatTableDataSource<PeriodicElement>(
        this.ELEMENT_DATA
      );
      this.isLoading = false
      this.agentSortandFilter = [...this.ELEMENT_DATA];
      this.selectedRowsList = [];

      this.isAnySelected.emit({
        isSelected: false,
        length: 0,
        selectedRows: []
      });
      this.selectedRowsList.length = 0;
      this.selection.clear();
      let upperLim: any;
      upperLim = this.uppreLimit;
      this.totalPageCounter = 1;
      var numberDiv = Number(this.uppreLimit) > Number(this.ELEMENT_DATA.length) ? Number(this.ELEMENT_DATA.length) : Number(this.uppreLimit)
      let newPage = Math.ceil(numberDiv / Number(e))
      this.currentPage = newPage;
      this.uppreLimit = Number(newPage) * e;
      this.lowerLimit = Number(this.uppreLimit) - Number(e) + 1;
      this.loadPagination(this.ELEMENT_DATA);
    });
  }

  changeItemLength(e) {
    this.isPaginationDropdown = false;
    if (this.ELEMENT_DATA.length === 0) {
      return
    }
    this.itemLength = Number(e);
    if (e > this.ELEMENT_DATA.length) {
      this.objFilter.itemLength = this.itemLength;
      this.objFilter.totalItems = this.ELEMENT_DATA.length;
      this.getRemainingData(e);
      return
    }
    else if (this.ELEMENT_DATA.length % e !== 0) {
      this.objFilter.itemLength = this.itemLength;
      this.objFilter.totalItems = this.ELEMENT_DATA.length;
      this.getRemainingData(e);
      return
    }
    this.totalPageCounter = 1;
    var numberDiv = Number(this.uppreLimit) > Number(this.ELEMENT_DATA.length) ? Number(this.ELEMENT_DATA.length) : Number(this.uppreLimit)
    let newPage = Math.ceil(numberDiv / Number(e))
    this.currentPage = newPage;
    this.uppreLimit = Number(newPage) * e;
    this.lowerLimit = Number(this.uppreLimit) - Number(e) + 1;
    this.loadPagination(this.ELEMENT_DATA);
  }

  setPagination() {
    this.isPaginationDropdown = false;
    this.totalPageCounter = 1;
    this.currentPage = 1;
    this.lowerLimit = 1;
    this.uppreLimit = 25;
    this.itemLength = 25;
    this.loadPagination(this.ELEMENT_DATA)
  }

  //  agentTags moreThan lessThan dateTag statusTags
  isPaginationDropdown: boolean = false;
  isDateDropdown: boolean = false;
  isDurationDropdown1: boolean = false;
  isDurationDropdown2: boolean = false;

  // show 'copied' Tooltip for 1 sec
  copyToClipboard(id: string) {
    if (this.checkDomain == 'callrater.com') {
      window.navigator.clipboard.writeText('https://callrater.com/#/admin/recordings?id=' + id);
    } else {
      window.navigator.clipboard.writeText('https://portal.convirzaai.com/#/admin/recordings?id=' + id);
    }
    this.elm.nativeElement.querySelector('#id_' + id).classList.add('display');
    setTimeout(() => {
      this.elm.nativeElement
        .querySelector('#id_' + id)
        .classList.remove('display');
    }, 1000);
  }
  tooltipPosition: string | 'tooltipBtm' = 'tooltips';

  // show summary(tooltip) accoring to the position of row(resocrding list)
  elemntEvt(e) {
    e.screenY > 450
      ? (this.tooltipPosition = 'tooltips')
      : (this.tooltipPosition = 'tooltipBtm');
  }

  // Scroll to top with pagination clicks
  scrollToTop(el) {
    var to = 0;
    var duration = 600;
    var start = el.scrollTop,
      change = to - start,
      currentTime = 0,
      increment = 20;

    var easeInOutQuad = function (t, b, c, d) {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    };

    var animateScroll = function () {
      currentTime += increment;
      var val = easeInOutQuad(currentTime, start, change, duration);

      el.scrollTop = val;
      if (currentTime < duration) {
        setTimeout(animateScroll, increment);
      }
    };
    animateScroll();
  }
  // New Filters
  dateRangeFilter: boolean = false;
  agentRangeFilter: boolean = false;
  durationRangeFilter: boolean = false;
  tagsRangeFilter: boolean = false;
  recordingRangeFilter: boolean = false;
  IDRangeFilter: boolean = false;
  CallTitleRangeFilter: boolean = false;
  statusRangeFilter: boolean = false;
  scoreRangeFilter: boolean = false;
  totalScoreRangeFilter: boolean = false;
  missedOpFilter: boolean = false;

  isAgentChecked: boolean = false;
  isTagChecked: boolean = false;
  isDurationChecked: boolean = false;
  isRecordingChecked: boolean = false;
  isStatusChecked: boolean = false;
  isMissedOpChecked: boolean = false;
  isScoreChecked: boolean = false;
  isIDChecked: boolean = false;
  isCAllTitleChecked: boolean = false;
  isTotalScoreChecked: boolean = false;

  agentInputBox: boolean = false;
  tagInputBox: boolean = false;
  CallTitleInputBox: boolean = false;

  isFilterList: boolean = false;
  selectedFilterItem: string = '';
  selectedAgent: string = 'is';
  selecteddateRange: string = 'is in the last';
  selectedTime: any = '';
  isInLastStatus: string = 'days';
  selectedDuration: string = 'is';
  selectedTotalScore: string = '=';
  durationFormat: string = 'seconds';
  selectedTag: string = 'is';
  selectedStatus: string = '';
  selectedScore: string = '';
  selectedMissedOp: any = 'true';
  selectedRecording: string = 'is';
  selectedCallTitle: string = 'is';
  selectedID: string = 'is';
  selecteddateRangeDay: string = 'Day';
  selecteddateRangeMonth: string = 'January';
  selecteddateRangeYear: string = '2022';
  monthCounter: number = 0;
  @ViewChild('inputRange') seachInput: ElementRef;

  AgentsuggestList = [];
  CallTitlesuggestList = [];
  TagssuggestList = [];
  Month = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
  YearArray = [
    '2010',
    '2011',
    '2012',
    '2013',
    '2014',
    '2015',
    '2016',
    '2017',
    '2018',
    '2019',
    '2020',
    '2021',
    '2022',
    '2023',
    '2024',
    '2025',
    '2026',
    '2027',
    '2028',
    '2029',
    '2030',
    '2033'
  ];
  currentAgent: string = '';
  currentAgentId: string = '';
  currentDuration: string = '';
  currentTotalScore: string = '';
  currentTag: string = '';
  currentRecording: string = '';
  currentID: string = '';
  currentCallTitle: string = '';
  currentMissedOp: string = '';
  agentInputText: string = '';
  CallTitleInputText: string = '';

  duplicateAgentSuggestList: Array<any> = []
  selectAgent(e) {
    // console.log('select Agent',e)
    this.agentInputText = e;
    this.AgentsuggestList = this.duplicateAgentSuggestList.filter(item => {
      let i = item.name.toLowerCase();
      if (i.includes(e.toLowerCase())) {
        return item;
      }
    });
  }
  DuplicateCallTitlesuggestList: Array<any> = []
  selectCallTitle(e) {
    this.CallTitleInputText = e;
    this.CallTitlesuggestList = this.DuplicateCallTitlesuggestList.filter(item => {
      let i = item.slice(0, e.length).toLowerCase();
      if (e === i.toLowerCase()) {
        return item;
      }
    });
  }
  selectDuration(event) {
    // if(i.key === 'e'){
    //   i.preventDefault();
    //   return
    // }else{
    //   this.elm.nativeElement.querySelector('#DInput').value = i.target.value;
    // this.currentDuration = i.target.value;
    const pattern = /[0-9\+\-\ ]/;

    let inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode != 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    } else {
      this.currentDuration = event.target.value;

    }

  }
  tagInputText: string = '';
  selectTags(e) {
    this.tagInputText = e;
    this.TagssuggestList = this.originalList.data.tags.filter(item => {
      let i = item.slice(0, e.length).toLowerCase();
      if (e === i.toLowerCase()) {
        return item;
      }
    });
  }
  selectRecording(i) {
    this.currentRecording = i;
  }
  selectID(i) {
    this.currentID = i;
  }
  // selectCallTitle(i) {
  //   this.currentID = i;
  // }
  onDateChange(e) {
    this.selectedTime = e;
  }
  isopenedDateF: boolean = false;
  isopenedAgentF: boolean = false;
  isopenedDurationF: boolean = false;
  isopenedTotalScoreF: boolean = false;
  isopenedRecordingF: boolean = false;
  isopenedIDF: boolean = false;
  isopenedStatusF: boolean = false;
  isopenedScoreF: boolean = false;
  isopenedTagF: boolean = false;
  isopenedGroupF: boolean = false;
  isopenedMissedF: boolean = false;
  isopenedCallTitleF: boolean = false;
  inTheLastValue: number = 7;
  checktiggerDate(e) {
    setTimeout(() => {
      this.isopenedDateF = e;
    }, 100);
  }
  closeDropsDate() {
    if (!this.isopenedDateF) {
      this.dateRangeFilter = false;
    }
  }
  checktiggerAgent(e) {
    setTimeout(() => {
      this.isopenedAgentF = e;
    }, 100);
  }
  closeDropsAgent() {
    if (!this.isopenedAgentF) {
      this.agentRangeFilter = false;
    }
  }
  checktiggerDuration(e) {
    setTimeout(() => {
      this.isopenedDurationF = e;
    }, 100);
  }
  closeDropsDuration() {
    if (!this.isopenedDurationF) {
      this.durationRangeFilter = false;
    }
  }
  checktiggerTotalScore(e) {
    setTimeout(() => {
      this.isopenedTotalScoreF = e;
    }, 100);
  }
  closeDropsTotalScore() {
    if (!this.isopenedTotalScoreF) {
      this.totalScoreRangeFilter = false;
    }
  }
  checktiggerRecording(e) {
    setTimeout(() => {
      this.isopenedRecordingF = e;
    }, 100);
  }
  closeDropRecording() {
    if (!this.isopenedRecordingF) {
      this.recordingRangeFilter = false;
    }
  }
  checktiggerStatus(e) {
    setTimeout(() => {
      this.isopenedStatusF = e;
    }, 100);
  }
  closeDropsStatus() {
    if (!this.isopenedStatusF) {
      this.statusRangeFilter = false;
    }
  }
  checktiggerTag(e) {
    setTimeout(() => {
      this.isopenedTagF = e;
    }, 100);
  }
  closeDropsTag() {
    if (!this.isopenedTagF) {
      this.tagsRangeFilter = false;
    }
  }
  checktiggerMissed(e) {
    setTimeout(() => {
      this.isopenedMissedF = e;
    }, 100);
  }
  closeDropsMissed() {
    if (!this.isopenedMissedF) {
      this.missedOpFilter = false;
    }
  }
  checktiggerScore(e) {
    setTimeout(() => {
      this.isopenedScoreF = e;
    }, 100);
  }
  closeDropsScore() {
    if (!this.isopenedMissedF) {
      this.scoreRangeFilter = false;
    }
  }
  checktiggerID(e) {
    setTimeout(() => {
      this.isopenedIDF = e;
    }, 100);
  }
  closeDropID() {
    if (!this.isopenedIDF) {
      this.IDRangeFilter = false;
    }
  }
  checktiggerCallTitle(e) {
    setTimeout(() => {
      this.isopenedCallTitleF = e;
    }, 100);
  }
  closeDropCallTitle() {
    if (!this.isopenedCallTitleF) {
      this.CallTitleRangeFilter = false;
    }
  }

  objFilter: any = { type: 'multiple' };
  onRefresh() {

    this.dateRangeFilter = false;
    this.agentRangeFilter = false;
    this.durationRangeFilter = false;
    this.statusRangeFilter = false;
    this.recordingRangeFilter = false;
    this.tagsRangeFilter = false;
    this.scoreRangeFilter = false;
    this.IDRangeFilter = false;
    this.CallTitleRangeFilter = false;
    this.totalScoreRangeFilter = false;
    this.onRefreshList.emit('clear');
    this.isLoading = true;
    this.playerController = false;
    this.unselectedRec();
    if (this.isTagChecked) {
      this.objFilter.tag = this.currentTag;
    } else {
      delete this.objFilter.tag
    }
    if (this.isStatusChecked) {
      this.objFilter.status = this.selectedStatus;
    } else {
      delete this.objFilter.status
    }
    if (this.isScoreChecked) {
      this.objFilter.scroring_status = this.selectedScore;
    } else {
      delete this.objFilter.scroring_status
    }
    if (this.isDurationChecked) {
      let duration: any;
      let sign: any;
      if (this.durationFormat === 'seconds') {
        duration = this.formateTime(this.currentDuration);
      } else {
        duration = String(this.currentDuration) + ':00';
      }
      this.selectedDuration === 'is'
        ? (sign = '=')
        : (sign = this.selectedDuration);
      this.objFilter.duration = sign + '~' + duration;
    } else {
      delete this.objFilter.duration
    }
    if (this.isTotalScoreChecked) {
      this.objFilter.total_score = this.selectedTotalScore + '~' + this.currentTotalScore
    } else {
      delete this.objFilter.total_score
    }
    if (this.isMissedOpChecked) {
      this.objFilter.missed_opportunity = this.selectedMissedOp;
    } else {
      delete this.objFilter.missed_opportunity
    }
    if (this.isRecordingChecked) {
      this.objFilter.recording_name =
        this.selectedRecording + '~' + this.currentRecording;
    } else {
      delete this.objFilter.recording_name
    }
    if (this.isIDChecked) {
      this.objFilter.convirza_id = this.currentID;
    } else {
      delete this.objFilter.convirza_id
    }
    if (this.isAgentChecked) {
      this.objFilter.agent = this.currentAgent;
    } else {
      delete this.objFilter.agent
    }
    if (this.isCAllTitleChecked) {
      this.objFilter.call_title = this.currentCallTitle;
    } else {
      delete this.objFilter.call_title
    }
    if (this.selecteddateRange === 'is in the last') {
      if (this.isInLastStatus === 'days') {
        let today = new Date();
        let lastweek = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 1 - this.inTheLastValue
        );
        this.objFilter.start_date = moment(lastweek).format('MM/DD/YY');
        this.objFilter.end_date = moment(today).format('MM/DD/YY');
      } else if (this.isInLastStatus === 'weeks') {
        let today = new Date();
        let lastweek = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 1 - this.inTheLastValue * 7
        );
        this.objFilter.start_date = moment(lastweek).format('MM/DD/YY');
        this.objFilter.end_date = moment(today).format('MM/DD/YY');
      } else if (this.isInLastStatus === 'months') {
        let today = new Date();
        let lastweek = new Date(
          today.getFullYear(),
          today.getMonth() - this.inTheLastValue,
          today.getDate()
        );
        this.objFilter.start_date = moment(lastweek).format('MM/DD/YY');
        this.objFilter.end_date = moment(today).format('MM/DD/YY');
      } else if (this.isInLastStatus === 'years') {
        let today = new Date();
        let lastweek = new Date(
          today.getFullYear() - this.inTheLastValue,
          today.getMonth(),
          today.getDate()
        );
        this.objFilter.start_date = moment(lastweek).format('MM/DD/YY');
        this.objFilter.end_date = moment(today).format('MM/DD/YY');
      }
    } else if (this.selecteddateRange === 'is in range') {
      this.objFilter.start_date = this.selectedTime.slice(0, 8);
      this.objFilter.end_date = this.selectedTime.slice(10, 19);
    } else if (this.selecteddateRange === 'is on') {
      if (this.selecteddateRangeDay === 'Day') {
        // console.log(this.objFilter.start_date,this.objFilter.start_date)
        this.objFilter.start_date = this.selectedTime;
        this.objFilter.end_date = this.selectedTime;
      } else if (this.selecteddateRangeDay === 'Month') {
        this.objFilter.start_date = moment().startOf('month').format('MM/DD/YY');
        this.objFilter.end_date = moment().endOf('month').format('MM/DD/YY');
      } else if (this.selecteddateRangeDay === 'Year') {
        let startYear = new Date(Number(this.selecteddateRangeYear), 0, 1);
        let endYear = new Date(Number(this.selecteddateRangeYear), 11, 31);
        this.objFilter.start_date = moment(startYear).format('MM/DD/YY');
        this.objFilter.end_date = moment(endYear).format('MM/DD/YY');
      }
    }


    let newArray = JSON.parse(localStorage.getItem('Selected_Group')) ? JSON.parse(localStorage.getItem('Selected_Group')) : 'all';
    this.objFilter.group_id = newArray
    delete this.objFilter.count;
    delete this.objFilter.totalItems;
    console.log(this.objFilter);
    this.listOfRecording.FilterList(this.objFilter).subscribe(data => {
      this.listOfRecording.state$.next(data);
      this.ELEMENT_DATA = data.data.recordings;
      this.originalList = data;
      this.setAgentList()
      this.TagssuggestList = data.data.tags.sort((a, b) => {
        return ('' + a).localeCompare(b)
      });;
      this.totalHits = data.data.hits;
      this.apiPageCount = data.data.count;
      this.agentSortandFilter = [...this.ELEMENT_DATA];
      this.agentData = data.data.agents;
      this.dataSource = new MatTableDataSource<PeriodicElement>(
        this.ELEMENT_DATA
      );
      // this.unselectedRec();
      this.setAgentList();
      this.newDursort = 'none'
      this.newAgentSort = 'none'
      this.newStatSort = 'none'
      this.newDateSort = 'none'
      this.agentSortandFilter = [...this.ELEMENT_DATA];
      this.setPagination();
      this.isLoading = false

      this.focusList = -1;
      console.log('data=======>', data);
    });

    this.listOfRecording.isRecordingDetail.next(false);
  }


  inputRangeVal: any = '';
  clearRangeFilter() {
    delete this.objFilter.totalItems
    // this.resetTreeFilter();
    this.newAgentSort = 'none';
    this.newDateSort = 'none';
    this.newDursort = 'none';
    this.newStatSort = 'none';
    this.dateRangeFilter = false;
    this.agentRangeFilter = false;
    this.durationRangeFilter = false;
    this.totalScoreRangeFilter = false;
    this.tagsRangeFilter = false;
    this.recordingRangeFilter = false;
    this.IDRangeFilter = false;
    this.statusRangeFilter = false;
    this.scoreRangeFilter = false;

    this.isFilterList = false;
    this.selectedFilterItem = '';
    this.selectedAgent = 'is';
    this.selecteddateRange = 'is in the last';
    this.selectedTime = '';
    this.isInLastStatus = 'days';
    this.selectedDuration = 'is';
    this.selectedTotalScore = 'is';
    this.selectedID = 'is';
    this.durationFormat = 'seconds';
    this.selectedTag = 'is';
    this.selectedStatus = '';
    this.selectedScore = '';
    this.selectedMissedOp = 'true';
    this.selectedRecording = 'is';
    this.selectedID = 'is';
    this.selecteddateRangeDay = 'Day';
    // this.selecteddateRangeMonth = 'January';
    this.selecteddateRangeMonth = moment().format('MMMM');
    this.selected = moment(new Date()).format('MM/DD/YY');
    this.selectedDouble = moment(new Date()).format('MM/DD/YY');
    this.selecteddateRangeYear = '2022';
    this.currentAgent = '';
    this.currentDuration = '';
    this.currentTotalScore = '';
    this.currentTag = '';
    this.currentRecording = '';
    this.currentCallTitle = '';
    this.currentID = '';
    this.currentMissedOp = '';
    this.isopenedDateF = false;
    this.isopenedAgentF = false;
    this.isopenedDurationF = false;
    this.isopenedTotalScoreF = false;
    this.isopenedGroupF = false;
    this.isopenedRecordingF = false;
    this.isopenedIDF = false;
    this.isopenedStatusF = false;
    this.isopenedCallTitleF = false;
    this.isopenedScoreF = false;
    this.isopenedTagF = false;
    this.isopenedMissedF = false;
    this.inTheLastValue = 7;
    this.isAgentChecked = false;
    this.isTagChecked = false;
    this.isDurationChecked = false;
    this.isTotalScoreChecked = false;
    this.isRecordingChecked = false;
    this.isIDChecked = false;
    this.isStatusChecked = false;
    this.isIDChecked = false;
    this.isScoreChecked = false;
    this.isMissedOpChecked = false;
    this.isScoreChecked = false;
    this.isCAllTitleChecked = false;

    this.agentInputBox = false;
    this.tagInputBox = false;
    this.CallTitleInputBox = false;
    this.monthCounter = 0;
    this.tagInputText = '';
    this.agentInputText = '';
    this.CallTitleInputText = '';
    this.setAgentList()
    this.TagssuggestList = this.originalList.data.tags;
    this.focusList = -1;
    this.focusList1 = -1;
    this.focusList2 = -1;
    this.CallTitlesuggestList = [...this.DuplicateCallTitlesuggestList]
    // this.onRefresh()
  }
  updateTable() {
    this.agentSortandFilter = this.ELEMENT_DATA;
    this.dataSource = new MatTableDataSource<PeriodicElement>(
      this.ELEMENT_DATA
    );
    this.loadPagination(this.ELEMENT_DATA);
    this.elm.nativeElement.querySelector('#paginationInput').blur();
    let tar = this.elm.nativeElement.querySelector('#target');
    this.scrollToTop(tar);
    this.focusList = -1;
  }

  newDursort: string = 'none'
  newAgentSort: string = 'none'
  newStatSort: string = 'none'
  newDateSort: string = 'none'
  newScoreSort: string = 'none'
  newTotalScoreSort: string = 'none'
  newGroupSort: string = 'none'
  newCallTitleSort: string = 'none'
  onDurationSort() {
    this.newAgentSort = 'none';
    this.newDateSort = 'none';
    this.newStatSort = 'none';
    this.newScoreSort = 'none';
    this.newGroupSort = 'none';
    this.newCallTitleSort = 'none';
    this.newTotalScoreSort = 'none';
    if (this.newDursort !== 'dcs') {
      this.newSortDuration('dcs');
      this.newDursort = 'dcs';
    } else {
      this.newSortDuration('acs');
      this.newDursort = 'acs';
    }
    this.updateTable()
  }
  onCallTitleSort() {
    this.newAgentSort = 'none';
    this.newDateSort = 'none';
    this.newStatSort = 'none';
    this.newScoreSort = 'none';
    this.newGroupSort = 'none';
    this.newDursort = 'none';
    this.newTotalScoreSort = 'none';
    if (this.newCallTitleSort !== 'dcs') {
      this.newCallTitleDuration('dcs');
      this.newCallTitleSort = 'dcs';
    } else {
      this.newCallTitleDuration('acs');
      this.newCallTitleSort = 'acs';
    }
    this.updateTable()
  }
  onAgentSort() {
    this.newStatSort = 'none';
    this.newDateSort = 'none';
    this.newDursort = 'none';
    this.newScoreSort = 'none';
    this.newGroupSort = 'none';
    this.newCallTitleSort = 'none';
    this.newTotalScoreSort = 'none';
    if (this.newAgentSort !== 'acs') {
      this.onAscending();
      this.newAgentSort = 'acs';
    } else {
      this.onDscending();
      this.newAgentSort = 'dcs';
    }
    this.updateTable()
  }
  onDateSort() {
    this.newAgentSort = 'none';
    this.newDursort = 'none';
    this.newStatSort = 'none';
    this.newScoreSort = 'none';
    this.newGroupSort = 'none';
    this.newCallTitleSort = 'none';
    this.newTotalScoreSort = 'none';
    if (this.newDateSort !== 'acs') {
      this.dateAcs();
      this.newDateSort = 'acs';
    } else {
      this.dateDcs();
      this.newDateSort = 'dcs';
    }
    this.updateTable()
  }
  onStatSort() {
    this.newAgentSort = 'none';
    this.newDateSort = 'none';
    this.newDursort = 'none';
    this.newScoreSort = 'none';
    this.newGroupSort = 'none';
    this.newCallTitleSort = 'none';
    this.newTotalScoreSort = 'none';
    if (this.newStatSort !== 'acs') {
      this.statusAcs();
      this.newStatSort = 'acs';
    } else {
      this.statusDcs();
      this.newStatSort = 'dcs';
    }
    this.updateTable()
  }
  onScoreSort() {
    this.newAgentSort = 'none';
    this.newDateSort = 'none';
    this.newDursort = 'none';
    this.newStatSort = 'none';
    this.newGroupSort = 'none';
    this.newCallTitleSort = 'none';
    this.newTotalScoreSort = 'none';
    if (this.newScoreSort !== 'acs') {
      this.scoreAcs();
      this.newScoreSort = 'acs';
    } else {
      this.scoreDcs();
      this.newScoreSort = 'dcs';
    }
    this.updateTable()
  }
  onTotalScoreSort() {
    this.newAgentSort = 'none';
    this.newDateSort = 'none';
    this.newDursort = 'none';
    this.newStatSort = 'none';
    this.newGroupSort = 'none';
    this.newScoreSort = 'none';
    if (this.newTotalScoreSort !== 'acs') {
      this.totalScoreAcs();
      this.newTotalScoreSort = 'acs';
    } else {
      this.totalScoreDcs();
      this.newTotalScoreSort = 'dcs';
    }
    this.updateTable()
  }
  onGroupSort() {
    this.newAgentSort = 'none';
    this.newDateSort = 'none';
    this.newDursort = 'none';
    this.newStatSort = 'none';
    this.newScoreSort = 'none';
    this.newCallTitleSort = 'none';
    this.newTotalScoreSort = 'none';
    if (this.newGroupSort !== 'acs') {
      this.groupAcs();
      this.newGroupSort = 'acs';
    } else {
      this.groupDcs();
      this.newGroupSort = 'dcs';
    }
    this.updateTable()
  }
  dateAcs() {
    this.ELEMENT_DATA = this.ELEMENT_DATA.sort((a: any, b: any) => {
      let f1: any = new Date(a?.date);
      let f2: any = new Date(b?.date);

      return f1 - f2;
    });
  }
  dateDcs() {
    this.ELEMENT_DATA = this.ELEMENT_DATA.sort((a: any, b: any) => {
      let f1: any = new Date(a?.date);
      let f2: any = new Date(b?.date);
      return f2 - f1;
    });
  }
  onAscending() {
    this.ELEMENT_DATA = this.ELEMENT_DATA.sort((a: any, b: any) => {
      return ('' + a.agent).localeCompare(b.agent);
    });
  }

  onDscending() {
    this.ELEMENT_DATA = this.ELEMENT_DATA.sort((a: any, b: any) => {
      return ('' + b.agent).localeCompare(a.agent);
    });
  }
  newSortDuration(str: string) {
    if (str == 'acs') {
      this.ELEMENT_DATA = this.ELEMENT_DATA.sort((a, b) => {
        return a.weight - b.weight;
      });
    } else {
      this.ELEMENT_DATA = this.ELEMENT_DATA.sort((a, b) => {
        return b.weight - a.weight;
      });
    }
  }
  newCallTitleDuration(str: string) {
    if (str == 'acs') {
      this.ELEMENT_DATA = this.ELEMENT_DATA.sort((a, b) => {
        return a.call_title - b.call_title;
      });
    } else {
      this.ELEMENT_DATA = this.ELEMENT_DATA.sort((a, b) => {
        return b.call_title - a.call_title;
      });
    }
  }
  statusAcs() {
    this.ELEMENT_DATA = this.ELEMENT_DATA.sort((a: any, b: any) => {
      return ('' + a.status).localeCompare(b.status);
    });
  }
  statusDcs() {
    this.ELEMENT_DATA = this.ELEMENT_DATA.sort((a: any, b: any) => {
      return ('' + b.status).localeCompare(a.status);
    });
  }
  scoreAcs() {
    this.ELEMENT_DATA = this.ELEMENT_DATA.sort((a: any, b: any) => {
      return ('' + a.scoring_status).localeCompare(b.scoring_status);
    });
  }
  scoreDcs() {
    this.ELEMENT_DATA = this.ELEMENT_DATA.sort((a: any, b: any) => {
      return ('' + b.scoring_status).localeCompare(a.scoring_status);
    });
  }
  totalScoreAcs() {
    this.ELEMENT_DATA = this.ELEMENT_DATA.sort((a: any, b: any) => {
      return b.total_score - a.total_score;
    });
  }
  totalScoreDcs() {
    this.ELEMENT_DATA = this.ELEMENT_DATA.sort((a: any, b: any) => {
      return a.total_score - b.total_score;

    });
  }
  groupAcs() {
    this.ELEMENT_DATA = this.ELEMENT_DATA.sort((a: any, b: any) => {
      return ('' + a.group_name).localeCompare(b.group_name);
    });
  }
  groupDcs() {
    this.ELEMENT_DATA = this.ELEMENT_DATA.sort((a: any, b: any) => {
      return ('' + b.group_name).localeCompare(a.group_name);
    });
  }
  focusList: number = -1;
  onUpDownAgent(e: KeyboardEvent) {

    let list = this.AgentsuggestList.length;
    let element: string = '#people_';
    if (e.code === 'ArrowDown') {
      let count = this.focusList + 1;
      if (count === list) {
        return;
      }
      this.focusList++;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList
      );
      el?.scrollIntoView(false);
    } else if (e.code === 'ArrowUp') {
      let count = this.focusList - 1;
      if (count === -1) {
        return;
      }
      this.focusList--;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList
      );
      el?.scrollIntoView(false);
    }

    if (e.code === 'Enter') {
      let i = this.AgentsuggestList[this.focusList]?.name;
      let id = this.AgentsuggestList[this.focusList]?.id;
      if (i) {
        this.agentInputText = i;
        this.currentAgent = i;
        this.currentAgentId = id;
        this.agentInputBox = false
        this.agentRangeFilter = false
      } else {
        return;
      }
    }
  }
  focusList2: number = -1;
  onUpDownCallTitle(e: KeyboardEvent) {
    let list = this.CallTitlesuggestList.length;
    let element: string = '#callTitle_';
    if (e.code === 'ArrowDown') {
      let count = this.focusList2 + 1;
      if (count === list) {
        return;
      }
      this.focusList2++;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList2
      );
      el?.scrollIntoView(false);
    } else if (e.code === 'ArrowUp') {
      let count = this.focusList2 - 1;
      if (count === -1) {
        return;
      }
      this.focusList2--;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList2
      );
      el?.scrollIntoView(false);
    }

    if (e.code === 'Enter') {
      let i = this.CallTitlesuggestList[this.focusList2];
      if (i) {
        this.CallTitleInputText = i;
        this.currentCallTitle = i;
        this.CallTitleInputBox = false
        this.CallTitleRangeFilter = false
      } else {
        return;
      }
    }
  }
  focusList1: number = -1;
  onUpDownTags(e: KeyboardEvent) {
    let list = this.TagssuggestList.length;
    let element: string = '#tag_';
    if (e.code === 'ArrowDown') {
      let count = this.focusList1 + 1;
      if (count === list) {
        return;
      }
      this.focusList1++;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList1
      );
      el?.scrollIntoView(false);
    } else if (e.code === 'ArrowUp') {
      let count = this.focusList1 - 1;
      if (count === -1) {
        return;
      }
      this.focusList1--;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList1
      );
      el?.scrollIntoView(false);
    }

    if (e.code === 'Enter') {
      let i = this.TagssuggestList[this.focusList1];
      if (i) {
        this.tagInputText = i;
        this.currentTag = i;
        this.tagInputBox = false;
        this.tagsRangeFilter = false;
      } else {
        return;
      }
    }
  }
  modalReference: NgbModalRef;
  @ViewChild('reprocess') reprocess: ElementRef;
  closeModal: string;
  errorIconClick(e: Event, id: string) {
    this.listOfRecording.Reprocess(id).subscribe(res => {
      console.log(res);
      if (res.status === 'success') {
        this.SubmitModal(this.reprocess);
        this.ELEMENT_DATA.filter(item => {
          if (item.id === id) {
            item.status = "Processing"
          }
        })
      }
    }, err => console.log(err))
    e.stopPropagation();
  }
  SubmitModal(content) {
    this.modalReference = this.modalService.open(content, { size: 'sm', centered: true })
    this.modalReference.result.then(
      res => {
        this.closeModal = `Closed with: ${res}`;
      },
      res => {
        this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
      }
    );
    setTimeout(() => {
      this.modalReference.close();
    }, 3000);
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

  openScrollableContent(longContent) {
    this.modalService.open(longContent, { scrollable: true });
  }

  private _transformer = (node: FoodNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
    };
  };

  totalGroupSelected: any = "Select Groups"

  getLevel = (node: TreeItemFlatNode) => node.level;

  isExpandable = (node: TreeItemFlatNode) => node.expandable;

  getChildren = (node: TreeItemNode): TreeItemNode[] => node.children;

  hasChild = (_: number, _nodeData: TreeItemFlatNode) => _nodeData.expandable;

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: TreeItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.item
      ? existingNode
      : new TreeItemFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.code = node.code;
    flatNode.expandable = node.children && node.children.length > 0;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  /** Whether all the descendants of the node are selected */
  descendantsAllSelected(node: TreeItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    return descendants.every(child => this.checklistSelection.isSelected(child));
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: TreeItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: TreeItemFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);
  }
  clicked_node: TodoItemFlatNode | null;
  clicked_num = 0;
  saveSelectedNodes(node: TodoItemFlatNode, e: any): void {

    const descendants = this.treeControl.getDescendants(node);

    if (!this.checklistSelection.isSelected(node)) {
      this.clicked_node = node;
      this.checklistSelection.select(node);
      this.allNodes.push(node.item)
    } else {
      if (this.clicked_num === 0 && this.checklistSelection.isSelected(node) && this.clicked_node) {
        console.log('first');
        e.source._checked = true
        e.checked = true
        this.checklistSelection.select(node);
        this.clicked_num = 1;
        this.checklistSelection.select(...descendants)
        descendants.forEach(i => {
          this.allNodes.push(i.item)
        })
      } else {
        // third-selection, deselect parent & all children
        this.clicked_node = null;
        this.clicked_num = 0;
        this.checklistSelection.deselect(node);
        this.checklistSelection.deselect(...descendants);
        let removal: any = []
        descendants.filter(i => {
          removal.push(i.item)
        }
        )
        removal.push(node.item);
        removal.forEach(el => {
          this.allNodes = this.allNodes.filter(item => {
            if (el !== item) {
              return item
            }
          });
        })
      }

    }
    // this.checklistSelection.toggle(node);
    //   this.checklistSelection.isSelected(node)
    //     ? this.checklistSelection.select(...descendants)
    //     : this.checklistSelection.deselect(...descendants);
    //   descendants.forEach(child => this.checklistSelection.isSelected(child));
    //   this.checkAllParentsSelection(node);
  }




  hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  // transformer = (node: TodoItemNode, level: number) => {
  //   const existingNode = this.nestedNodeMap.get(node);
  //   const flatNode =
  //     existingNode && existingNode.item === node.item ? existingNode : new TodoItemFlatNode();
  //   flatNode.item = node.item;
  //   flatNode.level = level;
  //   flatNode.expandable = !!node.children?.length;
  //   this.flatNodeMap.set(flatNode, node);
  //   this.nestedNodeMap.set(node, flatNode);
  //   return flatNode;
  // };

  /** Whether all the descendants of the node are selected. */
  // descendantsAllSelected(node: TodoItemFlatNode): boolean {
  //   const descendants = this.treeControl.getDescendants(node);
  //   const descAllSelected =
  //     descendants.length > 0 &&
  //     descendants.every(child => {
  //       return this.checklistSelection.isSelected(child);
  //     });
  //   return descAllSelected;
  // }

  /** Whether part of the descendants are selected */
  // descendantsPartiallySelected(node: TodoItemFlatNode): boolean {
  //   const descendants = this.treeControl.getDescendants(node);
  //   const result = descendants.some(child => this.checklistSelection.isSelected(child));
  //   return result && !this.descendantsAllSelected(node);
  // }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */


  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  todoLeafItemSelectionToggle(node: TodoItemFlatNode, e): void {
    if (e) {
      this.allNodes.push(node.item);
    } else {
      this.allNodes = this.allNodes.filter(item => {
        if (node.item !== item) {
          return item;
        }
      })
    }
    this.checklistSelection.toggle(node);
    // this.checkAllParentsSelection(node);
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  // checkAllParentsSelection(node: TodoItemFlatNode): void {
  //   let parent: TodoItemFlatNode | null = this.getParentNode(node);
  //   while (parent) {
  //     this.checkRootNodeSelection(parent);
  //     parent = this.getParentNode(parent);
  //   }
  // }
  ngAfterContentChecked() {

    this.cdref.detectChanges();

  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: TodoItemFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected =
      descendants.length > 0 &&
      descendants.every(child => {
        return this.checklistSelection.isSelected(child);
      });
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
      this.allNodes = this.allNodes.filter(item => {
        if (item !== node.item) {
          return item
        }
      })
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
      this.allNodes.push(node.item)
    }
  }

  /* Get the parent node of a node */
  getParentNode(node: TodoItemFlatNode): TodoItemFlatNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  /** Select the category so we can insert the new item. */


  /** Save the node to database */

  allNodes: Array<any> = []





  currentText: any = '';
  filterChanged(filterText: string) {
    this.currentText = filterText
    // this.filter(filterText);
    if (filterText) {
      this.treeControl.expandAll();
    } else {
      this.treeControl.collapseAll();
      this.treeControl.expand(this.treeControl.dataNodes[0])
      // this.treeControl.expandAll();
    }
  }
  buildFileTree(obj: any[], level: string): TreeItemNode[] {
    return obj.filter(o =>
      (<string>o.code)?.startsWith(level + '.')
      && (o.code.match(/\./g) || []).length === (level.match(/\./g) || []).length + 1
    )
      .map(o => {
        const node = new TreeItemNode();
        node.item = o.text;
        node.code = o.code;
        const children = obj.filter(so => (<string>so.code)?.startsWith(level + '.'));
        if (children && children.length > 0) {
          node.children = this.buildFileTree(children, o.code);
        }
        return node;
      });
  }

  treeData: any[] = []
  filteredTreeData;


newCurrentArr : any[] = []
  ngOnDestroy() {
    this.listOfRecording.filterLists.next(undefined);
  }
  isAnyGroup: boolean = false;
  private messageSource = new BehaviorSubject(undefined);
  currentMessage = this.messageSource.asObservable();
  public onApplyGroups(e) {

    console.log('ajsjasjajsjh', e)



    // localStorage.setItem('selectedNodes', JSON.stringify(this.checklistSelection.selected));

    // this.getGroups();
    this.modalService.dismissAll();
    this.totalGroupSelected = this.newCurrentArr.length + ' groups selected';
    // if (this.isRecordingDetail === true) {
    //   this.onRefreshDet();
    // } else {
      this.onRefresh();
    // }

  }



}
export class TreeItemNode {
  children: TreeItemNode[];
  item: string;
  code: string;
}
export class TreeItemFlatNode {
  item: string;
  level: number;
  expandable: boolean;
  code?: string;
}
