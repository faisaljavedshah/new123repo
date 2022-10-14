import { LocationStrategy } from '@angular/common';
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild, } from '@angular/core';
import { Router } from '@angular/router';
import {RecordingsTableComponent} from '../recordings-table/recordings-table.component'
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AuthenticationService, profileService } from 'src/app/_services';
import { RecordingLists } from 'src/app/_services/recordingList';
@Component({
  selector: 'app-recordings',
  templateUrl: './recordings.component.html',
  styleUrls: ['./recordings.component.scss'],

})
export class RecordingsComponent implements OnInit, OnDestroy{
  exclusions = ['svg']
  checkDomain=''
  @ViewChild('tagInput')tagInput : ElementRef
  @ViewChild(RecordingsTableComponent) private myChild: RecordingsTableComponent;
  @Output() onApplyGroups: EventEmitter <any> = new EventEmitter()
  CSV: boolean;
  csc: boolean;
  csv: boolean;
  isAdmin: boolean=false;
  GroupDataLoading : boolean = false;
  userData: any;
  constructor(
    private modalService: NgbModal,
    public listOfRecording: RecordingLists,
    private auth: AuthenticationService,
    private router: Router,
    private elm: ElementRef,
    private location: LocationStrategy,
    private profileService : profileService

  ) {
    history.pushState(null, null, window.location.href);
    // check if back or forward button is pressed.
    this.location.onPopState(() => {
        history.pushState(null, null, window.location.href);
    });
  }
  originalArray: any
  isRecordingDetail : boolean = false;
  agentSuggestList : any
  ngOnInit(): void {
    this.checkDomain = window.location.hostname
    this.userData = JSON.parse(localStorage.getItem('userInfo')) || JSON.parse(sessionStorage.getItem('userInfo'));
    if(this.userData.img === null || !this.userData.img){
      this.userData.img = 'https://www.freepik.com/free-vector/businessman-character-avatar-isolated_6769264.htm#query=user&position=0&from_view=search';
    }
    this.searchingFor = this.listOfRecording.searchedFor || 'people';
    this.listOfRecording.isRecordingDetail.subscribe(res=>{

      this.isRecordingDetail = res;
      if(!this.isRecordingDetail && this.listOfRecording.searchedKeyword){
        this.searchingFor = this.listOfRecording.searchedFor;
        this.searchValue = this.listOfRecording.searchedKeyword;
        if(this.searchingFor === "recordings"){
          this.getRecordingSuggestion(this.listOfRecording.searchedKeyword);
        }else{
          this.searchUsers(this.listOfRecording.searchedKeyword);
        }
      }
    })
    this.listOfRecording.recordingList().subscribe(d => {
      console.log(d);

      this.originalArray = d;
      this.agentList = d.data.agents;
      this.tagList = d.data.tags;
      this.agentSuggestList = d.data.agents_group;
      // localStorage.setItem('main_group',JSON.stringify(d.data.main_group));
      // localStorage.setItem('groups', JSON.stringify(d.data.groups));
      if(this.listOfRecording.searchedKeyword){
        this.searchValue = this.listOfRecording.searchedKeyword;
        this.searchingFor = this.listOfRecording.searchedFor;
        if(this.searchingFor === "recordings"){
          this.getRecordingSuggestion(this.listOfRecording.searchedKeyword);
        }else{
          this.searchUsers(this.listOfRecording.searchedKeyword);
        }
      }

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
  }
  @ViewChild('listContainer') container: ElementRef;
  getRecordingSuggestion(d){
    this.listOfRecording.searchKeywords(d).subscribe(res => {
      this.isListOpen = true;
      this.recordingList = res;
      this.searchingKeyword = false;
    });
  }
  @Output() newItemEventNewRe = new EventEmitter<any>();
  onUpDown(e: KeyboardEvent) {
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
      el?.scrollIntoView();
    } else if (e.code === 'ArrowUp') {
      let count = this.focusList - 1;
      if (count === -1) {
        return;
      }
      this.focusList--;
      let el: HTMLElement = this.elm.nativeElement.querySelector(
        element + this.focusList
      );
      el?.scrollIntoView();
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
  isDropDownActive: boolean = false;
  isDowloadable = false;
  selectedRowCount: number = 0;
  closeSelection: boolean = false;
  closeModal: string;
  buttonnone : boolean= false;
  tagsArr = [];
  emailArr = [];
  error: boolean = false;
  selectedRows: any;
  emailDropdown: boolean = false;
  isSearching: boolean = false;
  searchingFor: string = 'people';
  focusList: number = -1;
  searchingKeyword : boolean = false;
  reloadList : boolean = false;
  updatedIds: any = []
  updatedTags : any [];
  onUpdateTags : any =  {}
  isTagBtnActive : boolean = true;
  onSelectRow(e) {
    console.log(e.isSelected)
    this.selectedRows = e.selectedRows;
   this.isTagBtnActive = this.selectedRows.every(data=> data.tags.length < 20)
    this.isDowloadable = e.isSelected;
    this.selectedRowCount = e.length;
  }
  searchClicked() {
    this.isSearching = !this.isSearching;
  }
  shareClicked() {
    this.emailDropdown = !this.emailDropdown;
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
  onCloseSelection() {
    this.clearSeaching();
    this.closeSelection = true;
    setTimeout(() => {
      this.closeSelection = false;
    }, 0);
    this.isDropDownActive = false;
    this.isDowloadable = false;
    this.emailDropdown = false;
    this.audio = false;
    this.summary = false;
    this.transcirp = false;
    this.csc = false;
    this.emailArr = [];
    this.emailText = '';
    this.tagText = '';
    this.tagsArr = [];
  }
  addingUserTag :Array<any> = []
  onPressComma(){
    let maxTagLength : number = 0;
    this.selectedRows.map(res=>{
      if(res.tags.length > maxTagLength){
        maxTagLength = res.tags.length;
      }
    })
    if(maxTagLength >= 20){
      this.addingUserTag.length = 0;
      this.buttonnone= true;
    }else{
      let remainLength = 20 - maxTagLength;
      this.addingUserTag.length = remainLength;
    }
    this.addingUserTag = this.addingUserTag.filter(i => i);
    if(this.addingUserTag.length >= 20 ){
      this.buttonnone= true;
      this.tagText = '';
      return
    }
      if(this.tagText === ','){
        this.tagText = '';
        return
      }
    if(this.tagText !== ''){
      this.addingUserTag.push(this.tagText.trim().slice(0,25));
      this.addingUserTag = [...new Set(this.addingUserTag)];
      this.tagText = '';
    }
    this.tagText = '';
  }
  spliceTag(i) {
    this.addingUserTag.splice(i, 1);
  }
  arr: Array<any> = [];
  tagText : string = '';
  addTag(e: string) {
    this.tagText = e;
  }
  onApply() {
    this.activeTagBtn = false;
    if(this.tagText !== '' && this.tagText !== ','){
      this.addingUserTag.push(this.tagText);
      this.addingUserTag = [...new Set(this.addingUserTag)];
      this.tagText = '';
    }
    if(this.addingUserTag.length === 0){
      return
    }
    let ids = this.selectedRows.map(data => data.id);
    let maxTagLength : number = 0;
    this.selectedRows.map(res=>{
      if(res.tags.length > maxTagLength){
        maxTagLength = res.tags.length;
      }
    })
    if(maxTagLength >= 20){
      this.addingUserTag.length = 0;
    }else{
      let remainLength = 20 - maxTagLength;
      this.addingUserTag.length = remainLength;
    }

    this.addingUserTag = this.addingUserTag.filter(data => data)
    this.updatedTags = [...this.addingUserTag];
    this.listOfRecording
    .updateTags({ call_ids: ids, tags: this.addingUserTag })
    .subscribe(res => {
      console.log(res);
      this.tagText = '';
      this.updatedIds = res.data.call_ids;
      this.onUpdateTags = {ids : res.data.call_ids, tags : this.updatedTags}
      this.addingUserTag.length = 0;
        this.reloadList = !this.reloadList;
        this.onCloseSelection();
      });
  }
  onPressCommaEmail(){
    if(this.emailArr.length >= 10){
        this.emailText = '';
        this.error= true;
      return
    }
    if(this.validateEmail(this.emailText) && this.emailText !== ''){
         this.emailArr.push(this.emailText.trim());
         this.emailArr = [...new Set(this.emailArr)];
         this.emailText = '';
    }
  }
  validateEmail(email){
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }
  spliceEmail(i, e:Event) {
    this.emailArr.splice(i, 1);
    e.stopPropagation();
  }
  emailText :string = ''
  addEmail(e: string) {
    this.emailText = e;
  }
  @ViewChild('emailInput') EmailInput : ElementRef
  onApplyEmails() {
    if(this.EmailInput.nativeElement.value && this.validateEmail(this.EmailInput.nativeElement.value)){
      this.emailArr.push(this.EmailInput.nativeElement.value);
    }
    let ids = this.selectedRows.map(data=> data.id);
    if(this.emailArr.length > 10){
      this.emailArr.length = 10;
      this.error= true;
    }
    // if (this.arr1) {
    //   this.emailArr.push(...this.arr1);
    //   this.arr1.length = 0;
    // }
    this.emailArr = [...new Set(this.emailArr)];
    this.listOfRecording.shareEmails({call_ids : ids, emails : this.emailArr}).subscribe(res=>{
      console.log(res);
      this.reloadList = !this.reloadList;
        this.onCloseSelection();
      this.emailArr.length = 0
    })
    this.error= false;
  }
  onClearMails() {
    this.emailText = '';
    this.emailArr = [];
    this.error= false;
  }
  activeTagBtn: boolean = false;
  triggerModal(content) {
    this.activeTagBtn = true;
    this.modalService
      .open(content, { size: 'sm', centered: true, windowClass: 'tags-Modal' })
      .result.then(
        res => {
          this.closeModal = `Closed with: ${res}`;
        },
        res => {
          this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
        }
      );
  }
  onApplyFilterList(item){
    console.log(item)
    // localStorage.setItem('Selected_Group', item);

    this.myChild.onApplyGroups('Rec');
  }
  onApplyFilterRecList(){
    console.log('sdsd')
    // this.newItemEventNewRe.emit();
  }
  private getDismissReason(reason: any): string {
    this.tagText = '';
    this.activeTagBtn = false;
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  agentList: Array<object> = [];
  tagList: Array<string> = [];
  recordingList: Array<string> = [];
  searchedArr: any = [];
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
  renderList: any = undefined;
  loading: boolean = false;
  searchValue: string = '';
  filterRecordigns(e) {
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
    this.loading = true;
    this.listOfRecording.getSearchedArray(data).subscribe(res => {
      this.renderList = res;
      this.loading = false;
    });
    this.isSearching = false;
  }
  clearFilterList() {
    this.searchValue = '';
    this.renderList = undefined;
    this.loading = false;
    // this.isSearching = false;
    this.seachInput.nativeElement.value = '';
    this.searchedArr = [];
    this.tagsArr = [];

    this.recordingList = [];
    this.focusList = -1;
    this.isListOpen = false;
  }

  onRefreshList(e){
    if(e === 'clear'){
      this.searchingFor = 'people';
      this.seachInput.nativeElement.value = '';
      this.searchValue = '';
      this.searchedArr = [];
      this.tagsArr = [];
      this.recordingList = [];
      this.isListOpen = false;
    }
  }
  filterScreen:boolean=false;
  audio: boolean = false;
  summary: boolean = false;
  transcirp: boolean = false;
  selectDownloads(e, val) {
    console.log('Chhhhh',e,val)
    if (e.checked && val === 'audio') {
      this.audio = true;
    } else if (val === 'audio') {
      this.audio = false;
    }
    if (e.checked && val === 'Transcript') {
      this.transcirp = true;
    } else if (val === 'Transcript') {
      this.transcirp = false;
    }
    if (e.checked && val === 'summary') {
      this.summary = true;
    } else if (val === 'summary') {
      this.summary = false;
    }

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
  downloading: boolean = false;
  onDownload() {
    console.log('Ceck')
    this.downloading = true;
    let id = this.selectedRows.map(d => {
      return d.id;
    });
    let obj: any = {};
    if (this.summary && this.transcirp) {
      obj = { call_ids: id, transcript: 1, summary: 1 };
    } else if (this.summary) {
      obj = { call_ids: id, summary: 1 };
    } else if (this.transcirp) {
      obj = { call_ids: id, transcript: 1 };
    }
    else if (this.csv) {
      obj = { call_ids: id, csv: 1 };
    }
    // callId
    if(this.audio){
      obj.audio = 1
      obj.call_ids = id
    }
    console.log('Obj====>>>',obj)
    this.listOfRecording.downloadInfo(obj).subscribe(
      d => {
        console.log('DDDD',d)
        this.exportToCsv('Recordings', d.data);
        this.audio = false;
        this.downloading = false;
        this.summary = false;
        this.transcirp = false;
        this.csv = false;

        id.length = 0;
        obj = {};
        this.reloadList = !this.reloadList;
      },
      err => {
        console.log(err);
      }
    );
  }
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
  removeTagResponse : any
  removeTags(e){
    this.removeTagResponse = e;
  }
  ngOnDestroy(){
    this.listOfRecording.searchedFor = '';
    this.listOfRecording.searchedKeyword = '';
    this.profileService.currentTab = 0;
    this.listOfRecording.filterLists.next(undefined);
  }
}
declare global {
  interface Navigator {
    msSaveBlob: (blob: any, defaultName?: string) => boolean;
  }
}
