import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { Router } from '@angular/router';
import { ModalDismissReasons, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject } from 'rxjs';
import { RecordingDetails } from 'src/app/_services/recordingDetails';
import { updateRecordingDetails } from 'src/app/_services/updateRecordingDetails';
import * as moment from 'moment';
import {
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexFill,
  ApexChart,
  ChartComponent,
  ApexLegend
} from 'ng-apexcharts';
import { RecordingLists } from 'src/app/_services/recordingList';
import { debounceTime } from 'rxjs/operators';
import { LocationStrategy } from '@angular/common';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { ProfileComponent } from '../profile/profile.component';
import { RecordingsTableComponent } from '../recordings-table/recordings-table.component';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  fill: ApexFill;
  legend: ApexLegend;
  plotOptions: ApexPlotOptions;
};

@Component({
  selector: 'app-recording-list',
  providers:[ProfileComponent,RecordingsTableComponent ],
  templateUrl: './recording-list.component.html',
  styleUrls: ['./recording-list.component.scss'],
  encapsulation: ViewEncapsulation.Emulated
})
export class RecordingListComponent implements OnInit {
  isShow: boolean = false;
  bgColor: string = 'white';
  percentDone: any = '';
  name = '!!!';
  closeModal: string;
  isDateDropdown4 = false;
  viewMode = 'tab1';
  markView : boolean = false;
  textarea: boolean = false;
  iskeywordDropdown1: boolean = false;
  texttag: boolean = false;
  currentTab: string = 'By Frequency';
  tab: number = 1;
  topSkill: number = 0;
  currentteam: string = 'Choose type';
  loadingNote = false;
  loading = false;
  inditotal:number;
  onFocusEvt : boolean = false;
  isIndicatorsTab : boolean = false;
  selectIndicatorTab : number = 0;
  isDropDownActive4 : boolean = false
  isScoringOpen : boolean = false
  isPDF : boolean = false
  isCSV : boolean = false
  aa:any;
  customIndicators : any
  @ViewChild('chart') chart: ChartComponent;

  @Output() onApplyGroups: EventEmitter <any> = new EventEmitter()
  @Output() onTagRemove : any = new EventEmitter();
  public chartOptions: Partial<ChartOptions>;
  isAdmin: boolean = false;
  userData: any;
  constructor(
    private router: Router,
    private recorlist : ProfileComponent,
    private recorlist1 : RecordingsTableComponent,
    private auth: AuthenticationService,
    private detailsOfRecordings: RecordingDetails,
    private modalService: NgbModal,
    private updateDetails: updateRecordingDetails,
    private elm: ElementRef,
    public listOfRecording : RecordingLists,
    private location: LocationStrategy

  ) {
    this.audio = new Audio();
    history.pushState(null, null, window.location.href);
    // check if back or forward button is pressed.
    this.location.onPopState(() => {
      this.listOfRecording.isRecordingDetail.next(false);
        history.pushState(null, null, window.location.href);
    });
  }
  isLoading: boolean = true;
  RECORDINGSDETAIL: any;
  keywords: any;
  count: any;
  isFreq: boolean = true;
  sum: string = '';
  fourTabs: any = new Map();
  saleSkills: any = new Map();
  leadScores: any = new Map();
  selectedTabData: any;
  isDropdownShown: boolean = false;
  groupName : string = '';
  userRole : number;
  checkDomain=''
  isAudioAccess : boolean = true;
  isScoring : boolean = false;
  ngOnInit(): void {
    this.userData = JSON.parse(localStorage.getItem('userInfo')) || JSON.parse(sessionStorage.getItem('userInfo'));
    if(this.userData.img === null || !this.userData.img){
      this.userData.img = 'https://www.freepik.com/free-vector/businessman-character-avatar-isolated_6769264.htm#query=user&position=0&from_view=search';
    }
    this.userRole = JSON.parse(localStorage.getItem('user')).data.user.role;
    this.isAudioAccess = this.listOfRecording.isAudioAccess;
    this.checkDomain = window.location.hostname
    this.listOfRecording.recordingList().subscribe(d => {
      this.originalArray = d;
      this.agentList = d.data.agents;
      this.tagList = d.data.tags;

    });
    if(localStorage.getItem('adminInfo')){
      this.isAdmin = true;
  }else{
    this.isAdmin =false;
  }
    this.subject.pipe(debounceTime(1000)).subscribe((d: string) => {
      this.searchValue = d;
      if (d.length > 0) {
        this.listOfRecording.searchKeywords(d).subscribe(res => {
          this.isListOpen = true;
          this.recordingList = res;
          this.searchingKeyword = false;
        });
      } else {
        this.isListOpen = false;
        this.searchingKeyword = false;
        this.recordingList.length = 0;
      }
    });
    this.detailsOfRecordings.recordingDetails().subscribe(data => {
      this.RECORDINGSDETAIL = data.data;

      if(!Array.isArray(this.RECORDINGSDETAIL.custom_indicators)){
        this.isIndicatorsTab = true;
      }

      this.renderGraph(this.RECORDINGSDETAIL.indicator_total);
      Object.keys(this.RECORDINGSDETAIL.keywordsbylength).length > 0
        ? (this.isDropdownShown = true)
        : (this.isDropdownShown = false);
      this.keywords = Object.keys(this.RECORDINGSDETAIL.keywords);
      this.count = this.RECORDINGSDETAIL.keywords;
      this.groupName = this.RECORDINGSDETAIL.group;
      this.inditotal = this.RECORDINGSDETAIL.indicator_total;
      this.note = this.RECORDINGSDETAIL.notes;
      this.readDuration = this.formateTime(this.RECORDINGSDETAIL.duration)
      this.isLoading = false;
      console.log('======>', this.RECORDINGSDETAIL);
      this.fourTabs.set(
        '1Sales Skills',
        this.RECORDINGSDETAIL.indicators['Sales Skills']
      );
      this.fourTabs.set(
        '2Lead Score',
        this.RECORDINGSDETAIL.indicators['Lead Score']
      );
      this.fourTabs.set(
        '3Missed opportunity',
        this.RECORDINGSDETAIL.indicators['Missed Opportunity']
      );
      this.fourTabs.set(
        '4Conversion',
        this.RECORDINGSDETAIL.indicators['All Conversion']
      );
      this.setSkills();
      this.setLeadScore();
      this.selectedTabData = this.saleSkills;
      this.updateContent = [...this.RECORDINGSDETAIL.tags];
      if(this.RECORDINGSDETAIL.score_history){
        this.customIndicators = [...this.RECORDINGSDETAIL.score_history]
       this.isScoring = this.RECORDINGSDETAIL.score_history.some(item=>{
          return 'score1' in item || 'score2' in item
        });
      }
      // this.setColumns();
    },err =>{
      console.log(err);
      this.isLoading = false;
      alert(err);
    });
  }

  setColumns(){
    const parent = document.getElementById('parent');
    const items: any = parent.children;
    const rows = Math.ceil(items.length / 3);
    parent.style.height = `${ items[0].offsetHeight * rows }px`;
  }
  renderGraph(e) {
    this.chartOptions = {
      series: [e],
      chart: {
        height: 90,
        type: 'radialBar',
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        radialBar: {
          hollow: {
            margin: 2,
            size: '40%',
            background: 'transparent',
            image: undefined
          },
          dataLabels: {
            name: {
              show: false
            },
            value: {
              show: false
            }
          }
        }
      },
      colors:e > 49 ? ['#66CB9F']: ['#ff0000'],
      labels: [],
      legend: {
        show: false,
        floating: false,
        fontSize: '16px',
        position: 'left',
        offsetX: 50,
        offsetY: 10,
        labels: {
          useSeriesColors: true
        },
        formatter: function(seriesName, opts) {
          return seriesName + ':  ' + opts.w.globals.series[opts.seriesIndex];
        },
        itemMargin: {
          horizontal: 2
        }
      }
    };
  }
  setSkills() {
    this.saleSkills.set(
      'Company Name',
      this.RECORDINGSDETAIL.indicators['Company Name']
    );
    this.saleSkills.set(
      'Agent Name',
      this.RECORDINGSDETAIL.indicators['Agent Name']
    );
    this.saleSkills.set(
      'Ask for Caller Name',
      this.RECORDINGSDETAIL.indicators['Ask for Caller Name']
    );
    this.saleSkills.set(
      'Build Credibility (beta)',
      this.RECORDINGSDETAIL.indicators['Build Credibility (beta)']
    );
    this.saleSkills.set(
      'Take Ownership',
      this.RECORDINGSDETAIL.indicators['Take Ownership']
    );
    this.saleSkills.set(
      'Determine Needs',
      this.RECORDINGSDETAIL.indicators['Determine Needs']
    );
    this.saleSkills.set(
      'Asked for Business',
      this.RECORDINGSDETAIL.indicators['Asked for Business']
    );
    this.saleSkills.set(
      'End with thank you',
      this.RECORDINGSDETAIL.indicators['End with thank you']
    );
    this.saleSkills.set(
      'Agent Politeness',
      this.RECORDINGSDETAIL.indicators['Agent Politeness']
    );
    this.saleSkills.set(
      'All Conversion',
      this.RECORDINGSDETAIL.indicators['All Conversion']
    );
    this.saleSkills.set(
      'Existing Customer',
      this.RECORDINGSDETAIL.indicators['Existing Customer']
    );
    this.saleSkills.set(
      'Left Voicemail Message',
      this.RECORDINGSDETAIL.indicators['Left Voicemail Message']
    );
    this.saleSkills.set(
      'New Customer',
      this.RECORDINGSDETAIL.indicators['New Customer']
    );
  }
  setLeadScore() {
    this.leadScores.set(
      'Information received - Address',
      this.RECORDINGSDETAIL.indicators['Information received - Address']
    );
    this.leadScores.set(
      'Information received - Email',
      this.RECORDINGSDETAIL.indicators['Information received - Email']
    );
    this.leadScores.set(
      'Information received - Name',
      this.RECORDINGSDETAIL.indicators['Information received - Name']
    );
    this.leadScores.set(
      'Information received - Phone',
      this.RECORDINGSDETAIL.indicators['Information received - Phone']
    );
    this.leadScores.set(
      'All Conversion',
      this.RECORDINGSDETAIL.indicators['All Conversion']
    );
    this.leadScores.set(
      'New Customer',
      this.RECORDINGSDETAIL.indicators['New Customer']
    );
    this.leadScores.set(
      'Existing Customer',
      this.RECORDINGSDETAIL.indicators['Existing Customer']
    );
  }
  changeTabs(k, tab) {
    if (k === 0 || k === 1) {
      this.topSkill = k;
    }
    if (k === 0) {
      this.selectedTabData = this.saleSkills;
    } else if (k === 1) {
      this.selectedTabData = this.leadScores;
    }
  }
  deleteTag(k) {
    this.updateContent.splice(k, 1);
    // this.savetagWithOutClick();
  }
  savetagWithOutClick() {
    this.updateDetails
      .recordingDetailUpdate(this.updateContent, this.note)
      .subscribe(data => {
        console.log('hello===>', data);
      });
  }
  triggerModal(content) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title', centered: true, windowClass: 'reportModal' })
      .result.then(
        res => {
          this.closeModal = `Closed with: ${res}`;
        },
        res => {
          this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
        }
      );
    this.fileName = '';
  }
  modalReference: NgbModalRef;
  SubmitModal(content) {
  this.modalReference =   this.modalService.open(content, { size: 'sm', centered: true })
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
  // onKey(e) {
  //   let val = e.target.value;
  //   if (this.updateContent.every((x) => x !== val)) {
  //     console.log('not in list');
  //     this.elm.nativeElement.querySelector('#tagInput').value = '';
  //     this.updateContent.push(val);
  //   }

  //   this.elm.nativeElement.getElementById('#tagInput').focus();
  // }
  arr: Array<any> = [];
  addTag(e: string) {
      this.arr = e.split(',');
    this.arr = this.arr.map((d: string) => {
      return d.trim().slice(0, 25);
    });
  }

  // onApplyFilterList(){
  //

  // }
  public onApplyFilterList(): void {
    // console.log('helloooooo')
    // this.recorlist.testCall();
    console.log('helo List')
      // this.modalService.dismissAll();
    //  this.goToRecordings();
      // console.log('this.recorlist',this.recorlist1)
      this.goToRecordings();
      this.recorlist1.onApplyGroups('RefreshDet');

      // this.router.navigate(['/admin/recordings'])
  }
  tagValue(e) {
    this.tag = e;
  }
  note: any;
  noteValue(e) {
    this.note = e;
  }
  tag: any;
  updateContent = [];
  saveNote() {
    this.loadingNote = true;
    this.tag ? this.updateContent.push(this.tag) : null;
    this.updateDetails
      .recordingDetailUpdate(this.updateContent, this.note)
      .subscribe(data => {
        this.RECORDINGSDETAIL.notes = data.data.notes;
        this.note = this.RECORDINGSDETAIL.notes
        this.loadingNote = false;
        this.textarea = false;
      });
  }
  closeNotes() {
    this.note = '';
    this.updateDetails
      .recordingDetailUpdate(this.updateContent, this.note)
      .subscribe(data => {
        this.RECORDINGSDETAIL.notes = '';
      });
  }
  clickOutsideNote(){
    if(this.note !== this.RECORDINGSDETAIL.notes){
      this.saveNote();
    }else{
      setTimeout(() => {
        this.textarea =false;
      }, 1500);
    }
  }
  saveTag() {
    let tagLength = this.updateContent.length;
    if(tagLength > 20){
      tagLength = 20;
    }
    let remainingLength = 20 - tagLength;
    if (this.arr.length > remainingLength) {
      this.arr.length = remainingLength;
    }
    this.loading = true;
    if (this.arr.length > 0) {
      this.updateContent.push(...this.arr);
    }
    this.updateContent = [...new Set(this.updateContent)];
    this.updateContent = this.updateContent.filter(d => d);

    this.arr.length = 0;
    let el = this.elm.nativeElement.querySelector('#tagInput');
    if (el) {
      el.value = '';
    }
    this.tag ? this.updateContent.push(this.tag) : null;
    this.updateDetails
      .recordingDetailUpdate(this.updateContent, this.note)
      .subscribe(data => {
        this.onTagRemove.emit(data.data);
        this.loading = false;
        this.texttag = false;
      });
  }
  private getDismissReason(reason: any): string {
    this.fileName = '';
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  onBackPress() {
    this.router.navigateByUrl('/admin/recordings');
  }
  imageClick() {
    alert('Image Clicked');
  }
  show() {
    this.isShow = !this.isShow;
  }
  Ico_click() {
    alert('Clickedddsds');
  }
  buttclick() {
    alert('Button Clicked');
  }
  textclick() {
    alert('text Clicked');
  }
  tabclick() {
    alert('Clicked');
  }
  onChangeLangg(e) {
    this.isDateDropdown4 = false;
    this.currentteam = e;
  }

  // Audio Player

  @Input() playAudio?: any;
  duration: number = 100;
  currentTime: number = 0;
  readCurrentTime: string = '00:00';
  readDuration: string = '00:00';
  valume = 1;
  isPlay: boolean = false;
  muted: string = 'full';
  playingId: string;
  audio: any;
  isDurationDropdown1 = false;
  currentSpeed = '1';
  TransformVal(i) {
    return 'p' + Math.ceil(i);
  }
  TransforIndi(inditotal) {
    return 'p' + Math.ceil(inditotal);
  }
  playSpeed: any = 1;
  playBackSpeed(e) {
    this.playSpeed = e;
    this.isDurationDropdown1 = false;
    this.currentSpeed = e;
    this.audio.playbackRate = e;
  }
  playStreaming(data) {
    return new Observable(observer => {
      this.audio.src = data;
      // this.audio.currentTime = this.currentTime;
      this.audio.playbackRate = this.playSpeed;
      this.audio.play();
      this.isPlay = true;
      this.readDuration = this.formateTime(this.RECORDINGSDETAIL.duration);
      const handle = (events: Event) => {
        this.currentTime = this.audio.currentTime;
        this.readCurrentTime = this.formateTime(this.currentTime);
        this.duration = this.audio.duration;
        observer.next(events);
      };
      const ended = (events: Event) => {
        this.readCurrentTime = '00:00';
        this.currentTime = 0;
        this.isPlay = false;
      };
      this.audio.addEventListener('ended', ended);
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
    if (value == 0) {
      this.mute();
    } else {
      this.audio.volume = value;
      this.valume = value;
      this.setVolumeIcon(value);
    }
  }
  setVolumeIcon(e) {
    if (e < 0.34 && e > 0) {
      this.muted = 'low';
    } else if (e > 0.33 && e < 0.67) {
      this.muted = 'medium';
    } else if (e > 0.66) {
      this.muted = 'full';
    }
  }
  mute() {
    this.audio.volume = 0;
    this.valume = 0;
    this.muted = 'mute';
  }
  Unmute() {
    this.audio.volume = 1;
    this.valume = 1;
    this.muted = 'full';
  }
  previous() {
    this.audio.currentTime -= 10;
  }
  pause() {
    this.isPlay = false;
    this.audio.pause();
  }

  next() {
    this.audio.currentTime += 10;
  }
  playcount = 0;
  play() {
    if (this.playcount === 0) {
      this.playStreaming(this.RECORDINGSDETAIL.recording).subscribe();
      this.playcount++;
    } else {
      this.audio.play();
      this.isPlay = false;
    }
    this.isPlay = true;
  }
  stop() {}
  isEnd() {
    return false;
  }
  onClose(): void {
    this.audio.pause();
  }
  ngOnDestroy(): void {
    this.audio.pause();
  }
  onKeyword(e: string) {
    this.iskeywordDropdown1 = false;
    this.currentTab = e;
    if(e === 'Alphabetically'){
      setTimeout(() => {
        this.setColumns();
      }, 100);
    }
  }
  fileName: string = '';
  formData: FormData = new FormData();
  uploadFile(event: any) {
    this.fileName = event.target['files'][0].name;
    this.formData.append('attachment', event.target.files[0], 'file');
  }
  @ViewChild('issueReported') issueReported: ElementRef;
  reportText: string = '';
  rescoreText: string = '';
  IssueReporting(e) {
    this.reportText = e;
  }
  isReportingIssues : boolean = false;
  reportIssue() {
    this.isReportingIssues = true;
    this.fileName = '';
    let obj = {
      description : this.rescoreText,
      recordingId: this.RECORDINGSDETAIL.id,
      email: localStorage.getItem('email')
    }
    console.log(obj);

    this.detailsOfRecordings.reportAnIssue(obj).subscribe(data => {
      this.isReportingIssues = false;
      if (data.status === 'success') {
        this.SubmitModal(this.issueReported);
        this.RECORDINGSDETAIL.scoreStatus = 'Rescore Request 1';
        this.listOfRecording.changesStatus.next({id : this.RECORDINGSDETAIL.id , status : 'Scored'});
        this.reportText = '';
        this.fileName = '';
      }else{
        alert(data.message)
      }
    }, err=>{
      alert(err)
    });
  }
  isMarkLoading : boolean = false;
  markAsReview(){
      this.isMarkLoading = true;
      this.detailsOfRecordings.markAsReview({description : 'marked_as_reviewed',recordingId: this.RECORDINGSDETAIL.id}).subscribe(res=>{
        console.log(res);
        if(res.status === 'success'){
        this.isMarkLoading = false;
        this.markView = !this.markView;
        this.RECORDINGSDETAIL.scoreStatus = 'Reviewed';
        this.listOfRecording.changesStatus.next({id : this.RECORDINGSDETAIL.id , status : 'Reviewed'});
      }
    })
  }

  logOut(): void {
    this.auth.logout();
  }

  switchUser(){
    localStorage.removeItem('userInfo')
    localStorage.removeItem('Selected_Group')
    localStorage.removeItem('buildTree')
    localStorage.removeItem('groupsTree')
    localStorage.removeItem('logo')
    localStorage.removeItem('athena_refresh_token')
    localStorage.removeItem('user')
    localStorage.removeItem('athena_access_token')
    localStorage.removeItem('groups');
    localStorage.setItem('token', localStorage.getItem('admin_token'));
    this.router.navigate(['/administrator'])
  }
  reScoreReview(){
    console.log('Review');

  }
  activeTextArea() {
    setTimeout(() => {
      this.textarea = !this.textarea;
    }, 50);
  }


  // Search Flow
searchingFor: string = 'people';
tagsArr = []
focusList : number = -1
agentList: Array<object> = [];
tagList: Array<string> = [];
recordingList: Array<string> = [];
searchedArr: any = [];
isSearching : boolean = false;
originalArray: any = [];
searchingKeyword : boolean = false;
@ViewChild('listContainer') container: ElementRef;
onUpDown(e: KeyboardEvent) {
  // e.preventDefault();
  let list: any;
  let element: string = '';
  if (this.searchingFor === 'recordings') {
    list = this.recordingList.length;
    element = '#recordings_';
  } else if (this.searchingFor === 'tags') {
    list = this.tagsArr.length;
    element = '#tags_';
  } else if (this.searchingFor === 'people') {
    list = this.searchedArr.length;
    element = '#people_';
  }
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
    if (this.searchingFor === 'people') {
      let i = this.searchedArr[this.focusList]?.name;
      if (i) {
        this.seachInput.nativeElement.value = i;
        this.filterRecordigns(i);
      } else {
        return;
      }
    } else if (this.searchingFor === 'tags') {
      let i = this.tagsArr[this.focusList];
      if (i) {
        this.seachInput.nativeElement.value = i;
        this.filterRecordigns(i);
      } else {
        return;
      }
    } else if (this.searchingFor === 'recordings') {
      let i = this.recordingList[this.focusList];
      if (i) {
        this.seachInput.nativeElement.value = i;
        this.filterRecordigns(i);
      }
    }
  }
}
searchUsers(e: string) {
  this.searchValue = e;
  if(this.searchValue.length > 0){
    this.isListOpen = true;
  }else{
    this.isListOpen = false;
  }
  if (e === '') {
    this.searchedArr.length = 0;
    return;
  }
  if (this.searchingFor === 'people') {
    this.searchedArr = this.agentList.filter((item: any) => {
      let i = item.name.slice(0, e.length).toLowerCase();
      if (i === e.toLowerCase()) {
        return item;
      }
    });
  }

  if (this.searchingFor === 'tags') {
    this.tagsArr = this.tagList.filter((item: any) => {
      let i = item.slice(0, e.length).toLowerCase();
      if (i === e.toLowerCase()) {
        return item;
      }
    });
  }
}
results$: Observable<any>;
subject = new Subject();
isListOpen :boolean = false;
searchRecordings(e) {
  if(this.searchValue.length > 0){
    this.isListOpen = true;
  }else{
    this.isListOpen = false;
  }
  this.subject.next(e);
  this.searchingKeyword = true;
}
@ViewChild('seachInput') seachInput: ElementRef;
agentSelected(e) {
  this.seachInput.nativeElement.value = e.name;
}
clearSeaching() {
  // this.seachInput.nativeElement.value = '';
  this.searchedArr.length = 0;
  this.tagsArr.length = 0;
  this.recordingList.length = 0;
  this.focusList = -1;
}
renderList: any = undefined;
// loading: boolean = false;
searchValue: string = '';
filterRecordigns(e) {
  this.listOfRecording.searchedFor = this.searchingFor;
  this.isLoading = true;
  this.isSearching = false;
  let keyword: string = e;
  this.searchValue = e;
  let type = '';
  if (this.searchingFor === 'recordings') {
    type = 'recording';
  } else if (this.searchingFor === 'people') {
    type = 'agent';
  } else if (this.searchingFor === 'tags') {
    type = 'tag';
  }
  let data = { type: type, filter: keyword };
  this.listOfRecording.getSearchedArray(data).subscribe(res => {
    this.listOfRecording.filterLists.next(res);
    this.renderList = res;
    this.listOfRecording.searchedKeyword = e;
    // this.router.navigate(['/admin/recordings'])
    this.listOfRecording.isRecordingDetail.next(false);
    this.isLoading = false;
  });
}
clearFilterList() {
  this.searchValue = '';
  this.renderList = this.originalArray;
  this.loading = false;
  this.isListOpen = false;
  this.seachInput.nativeElement.value = '';
  this.searchedArr = [];
  this.tagsArr = [];
  this.recordingList = [];
  this.focusList = -1;
}
goToRecordings(){
  this.listOfRecording.isRecordingDetail.next(false);
}
isPDFDownloading : boolean = false;
showOptionsKeywords(e, i){
  console.log(e, i);
  if(i === 'CSV'){
    this.isCSV = e.checked
  }else{
    this.isPDF = e.checked
  }
}
onDownload(){
  if(this.isCSV){
    this.makeCSVdata();
    this.isCSV = false;
    // this.exportToCsv('Scoring History', this.customIndicators)
    this.isDropDownActive4 = false
  }
  if(this.isPDF){
    this.isPDFDownloading = true;
    this.ScoringHistoryPDF();
  }
}
makeCSVdata(){
  let data = [];
  this.customIndicators.forEach(item=>{
    let obj = {}
    obj['Indicator'] = item.name;
    obj['Version 1'] = item.score1;
    if(item.score2){
      obj['Version 2'] = item.score2;
    }
    data.push(obj);

    if(item.childs){
      if(item.childs.length > 0){
        item.childs.forEach(child=>{
          let childObj = {}
          childObj['Indicator'] =  '          =>  ' +  child.name;
          childObj['Version 1'] =  '          =>  ' +  child.score1;
          childObj['Version 2'] =  '          =>  ' +  child.score2;
          console.log(childObj);

          data.push(childObj);
        })
      }
    }
  })
  this.exportToCsv('Scoring History', data);

}

// Version sorting

Version1Sort : string = 'none'
Version2Sort : string = 'none'
IndicatorSort : string = 'none'
onIndicatorsSort(){
  this.Version1Sort = 'none';
  this.Version2Sort = 'none';
  if(this.IndicatorSort !== 'dcs'){
    this.goForSortIndicators('dcs');
    this.IndicatorSort = 'dcs';
  }else{
    this.goForSortIndicators('acs');
    this.IndicatorSort = 'acs';
  }
}
goForSortIndicators(str: string) {

  if (str == 'acs') {
    this.customIndicators = this.customIndicators.sort((a, b) => {
      return ('' + a.name).localeCompare(b.name);
    });
  } else {
    this.customIndicators = this.customIndicators.sort((a, b) => {
      return ('' + b.name).localeCompare(a.name);
    });
  }
}
onVersion1Sort(){
  this.IndicatorSort = 'none';
  this.Version2Sort = 'none';
  if(this.Version1Sort !== 'dcs'){
    this.goForSortVersion1('dcs');
    this.Version1Sort = 'dcs';
  }else{
    this.goForSortVersion1('acs');
    this.Version1Sort = 'acs';
  }
}
goForSortVersion1(str: string) {
  if (str == 'acs') {
    this.customIndicators = this.customIndicators.sort((a, b) => {
      return a.score1 - b.score1
    });
  } else {
    this.customIndicators = this.customIndicators.sort((a, b) => {
      return b.score1 - a.score1
    });
  }
  console.log(this.customIndicators );

}
onVersion2Sort(){
  this.IndicatorSort = 'none';
  this.Version1Sort = 'none';
  if(this.Version2Sort !== 'dcs'){
    this.goForSortVersion2('dcs');
    this.Version2Sort = 'dcs';
  }else{
    this.goForSortVersion2('acs');
    this.Version2Sort = 'acs';
  }
}
goForSortVersion2(str: string) {
  if (str == 'acs') {
    this.customIndicators = this.customIndicators.sort((a, b) => {
      return a.score2 - b.score2
    });
  } else {
    this.customIndicators = this.customIndicators.sort((a, b) => {
      return b.score2 - a.score2
    });
  }
}
  // Download CSV

  exportToCsv(filename: string, rows: object[]) {
    if (!rows || !rows.length) {
      return;
    }
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows
        .map(row => {
          return keys
            .map(k => {
              let cell = row[k] === null || row[k] === undefined ? '' : row[k];
              cell =
                cell instanceof Date
                  ? cell.toLocaleString()
                  : cell.toString().replace(/"/g, '""');
              if (cell.search(/("|,|\n)/g) >= 0) {
                cell = `"${cell}"`;
              }
              return cell;
            })
            .join(separator);
        })
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) {
      // IE 10+
      navigator.msSaveBlob(blob, filename);
    } else {
      const link = document.createElement('a');
      if (link.download !== undefined) {
        // Browsers that support HTML5 download attribute
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }
  async ScoringHistoryPDF() {
    await new Promise(r => setTimeout(r, 500));
    // let userName = JSON.parse(this.UserName);
      // document.getElementById('HideCallKeyWord').style.display = 'none';
      let DATA = document.getElementById('ScroringHistory');
      html2canvas(DATA).then(canvas => {
        // console.log(canvas);

        let fileWidth = 208;
        let fileHeight = (canvas.height * fileWidth) / canvas.width;
        // console.log(fileHeight, fileWidth);

        const FILEURI = canvas.toDataURL('image/png');
        let PDF = new jsPDF('p', 'in', [12, 18]);
        let position = 10;
        PDF.addImage(FILEURI, 'PNG', 0, 1, 12, 16 );
        PDF.save('Scoring History PDF');
        // this.callkey = false;
      });
      this.isDropDownActive4 = false
      this.isPDFDownloading = false;
      // this.isPDF = false;
  }
  downloadPagePDF(){
    this.recordingDetailPDF()
  }
  async recordingDetailPDF() {
    await new Promise(r => setTimeout(r, 500));
    // let userName = JSON.parse(this.UserName);
      // document.getElementById('HideCallKeyWord').style.display = 'none';
      let DATA = document.getElementById('main_page');
      html2canvas(DATA).then(canvas => {
        console.log(canvas);

        let fileWidth = 208;
        let fileHeight = (canvas.height * fileWidth) / canvas.width;
        const FILEURI = canvas.toDataURL('image/png');
        let PDF = new jsPDF('p', 'mm', 'a4');
        let position = 10;
        PDF.addImage(FILEURI, 'PNG', 0, position, fileWidth, fileHeight);
        PDF.save('Scoring History PDF');
        // this.callkey = false;
      });
      // this.isDropDownActive4 = false
      // this.isPDFDownloading = false;
      // this.isPDF = false;
  }
}


// For CSV download
declare global {
  interface Navigator {
    msSaveBlob: (blob: any, defaultName?: string) => boolean;
  }
}
