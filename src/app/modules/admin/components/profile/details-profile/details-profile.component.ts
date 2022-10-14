import { LocationStrategy } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { profileService } from 'src/app/_services';
import { RecordingLists } from 'src/app/_services/recordingList';

@Component({
  selector: 'app-details-profile',
  templateUrl: './details-profile.component.html',
  styleUrls: ['./details-profile.component.scss']
})
export class DetailsProfileComponent implements OnInit , OnDestroy{
  currentteam = 'Teamless users'
  currentmanager= 'Anna Potemkina '
  currenttteam = 'Team Fluffy'
  currentstat = 'Active'
  currentstats = 'Active'
  isDateDropdown2 = false;
  isDateDropdown6 = false;
  isDateDropdown3 = false;
  isDateDropdown4 = false;
  isDateDropdown5 = false;
  isDateDropdown7 = false;
  isDateDropdown8 = false;
  isssLoading  = false;
  currentuser = 'Choose user'
  isDateDropdown1 = false;
  closeModal: string;
  editTeam : boolean = false;
  addUser : boolean = false;
  activeNumber : number = 25;
  teamdetail : Array<any> = []
  itemLength: number = 25;
  lowerLimit = 0;
  uppreLimit = 25;
  totalArraySize = 18;
  totalPageCounter = 1;
  currentPage = 1;
  newElementArray: any;
  issPaginationDropdown: boolean;
  teamName : string = ''
  activeUsers : number = 0
  totalUsers : number = 0
  editUserFirstName : string = ''
  editUserLastName : string = ''
  editUserEmail : string = ''
  updateGroupName : string = ''
  editUserStatus : string = 'Active'
  editUserID : number
  currentRole = 'Choose authority';
  currentTeamID : string = '0'
  userFirstNameErr : boolean = false;
  userSecNameErr : boolean = false;
  userEmailErr : boolean = false;
  userStatusErr : boolean = false;
  userTeamErr : boolean = false;
  userRoleErr : boolean = false;
  editUserCurrentTeam : number = -1;
  allTeams : any
  isUpdating : boolean = false;

  copyTeamDetail : any

  ngOnInit(): void {
    this.isssLoading = true;
    this.profile.fetchTeamUsers().subscribe((res:any)=>{
      this.isssLoading = false;
      this.teamdetail = res.data.users
      this.copyTeamDetail = res.data.users
      this.teamdetail = this.teamdetail.map(item=>{
        item['drp'] = false;
        return item
      });
      this.loadPagination(this.copyTeamDetail);
      this.currenttteam = this.teamName;
        console.log('team users--------->',res);

    })
    this.listOfRecording.recordingList().subscribe(d => {

      this.originalArray = d;
      this.agentList = d.data.agents;
      this.tagList = d.data.tags;
    });
    this.profile.allTeam.subscribe(res=>{
      this.allTeams = res;
    })
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
  this.teamName = this.profile.currentTeam?.name;
  this.updateGroupName = this.profile.currentTeam?.name;
  this.activeUsers = this.profile.currentTeam?.activeUsers;
  this.totalUsers = this.profile.currentTeam?.totalUsers;
  // this.editUserID = this.profile.currentTeam?.id;
  this.currentTeamID = this.profile.currentTeam?.id;

  }

  loadPagination(e) {
    this.newElementArray = e;
    this.teamdetail = (
      this.copyTeamDetail.slice(this.lowerLimit, this.uppreLimit)
    );
    this.totalArraySize = this.copyTeamDetail.length;
    this.totalPageCounter = Math.ceil(Math.abs(this.copyTeamDetail.length / this.itemLength));
  }
  onNextPagee() {
    let dar = document.getElementById('main-drawer');
    this.scrollToTop(dar);
    let upperLim: any;
    upperLim = this.uppreLimit;
    this.lowerLimit += this.itemLength;
    this.uppreLimit += this.itemLength;
    this.currentPage++;

    if (
      this.uppreLimit > this.copyTeamDetail.length &&
      upperLim >= this.copyTeamDetail.length
    ) {
      this.lowerLimit -= this.itemLength;
      this.uppreLimit -= this.itemLength;
      this.currentPage--;
      return;
    }
    this.loadPagination(this.copyTeamDetail);
  }
  onPrevPagee() {
    let dar = document.getElementById('main-drawer');
    this.scrollToTop(dar);
    this.lowerLimit -= this.itemLength;
    this.uppreLimit -= this.itemLength;
    this.currentPage--;
    if (this.lowerLimit < 0) {
      this.currentPage++;
      this.lowerLimit += this.itemLength;
      this.uppreLimit += this.itemLength;
      return;
    }
    this.loadPagination(this.copyTeamDetail);
  }
  changeItemLength(e) {
    this.issPaginationDropdown = false;
    this.totalPageCounter = 1;
    this.currentPage = 1;
    this.lowerLimit = 0;
    this.uppreLimit = Number(e);
    this.itemLength = Number(e);
    this.loadPagination(this.copyTeamDetail);
  }
  // Scroll to top with pagination clicks
  scrollToTop(el) {
    var to = 0;
    var duration = 600;
    var start = el.scrollTop,
      change = to - start,
      currentTime = 0,
      increment = 20;

    var easeInOutQuad = function(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    };

    var animateScroll = function() {
      currentTime += increment;
      var val = easeInOutQuad(currentTime, start, change, duration);

      el.scrollTop = val;
      if (currentTime < duration) {
        setTimeout(animateScroll, increment);
      }
    };
    animateScroll();
  }
  // isLoading : boolean = false;

  constructor(private modalService: NgbModal, private profile: profileService, private elm: ElementRef, private listOfRecording : RecordingLists, private router : Router, private location: LocationStrategy) {
    history.pushState(null, null, window.location.href);
    // check if back or forward button is pressed.
    this.location.onPopState(() => {
      this.profile.isProfileDetail.next(false);
        history.pushState(null, null, window.location.href);
    });
   }

  triggerModal(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', windowClass  : 'Create-User' }).result.then((res) => {
      this.closeModal = `Closed with: ${res}`;
    }, (res) => {
      this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
    });
  }
  private getDismissReason(reason: any): string {
    this.removeAllErrors();
    this.addUser = false;
    this.editTeam = false;
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  onBackPress() {
    this.profile.currentTab = 1;
    this.profile.isProfileDetail.next(false);
  }
  iconclick() {
    alert('Clicked');
  }
  onChangeLang(e) {
    this.isDateDropdown2 = false;
    this.currentteam = e;
  }
  onChangestats(e) {
    this.isDateDropdown1 = false;
    this.editUserStatus = e;
  }
  onChangeStat(e) {
    this.isDateDropdown5 = false;
    this.currentstat = e;
  }
  onChangeusser(e) {
    this.isDateDropdown5 = false;
    this.currentuser = e;
  }
  onChangeLlang(e, item) {
    console.log(item);

    this.currentTeamID = item.id;
    this.isDateDropdown6 = false;
    this.currenttteam = e;
  }
  onChangemanager(e){
    this.isDateDropdown7 = false;
    this.currentmanager = e;
  }
  goTo(e) {
    this.elm.nativeElement.querySelector('#paginationInput').blur();
    let dar = document.getElementById('main-drawer');
    this.scrollToTop(dar);

    // this.scrollToTop(target)
    if (e <= this.totalPageCounter) {
      if(e < 1){
        return
      }
      if (e == 1) {
        this.changeItemLength(this.itemLength);
        return;
      }
      let upper = this.itemLength * Number(e);
      let lower = upper - this.itemLength;
      this.teamdetail = this.copyTeamDetail.slice(lower, upper);
        this.currentPage = e;
        this.lowerLimit = lower;
        this.uppreLimit = upper;
    }
  }
  validateNumber(event) {
    const keyCode = event.keyCode;

    const excludedKeys = [8, 37, 39, 46];

    if (((keyCode >= 48 && keyCode <= 57) ||
      (keyCode >= 96 && keyCode <= 105) &&
      (excludedKeys.includes(keyCode)))) {
      event.preventDefault();
    }
  }


  // Search Flow
  searchingFor: string = 'people';
  tagsArr = [];
  focusList: number = -1;
  agentList: Array<object> = [];
  tagList: Array<string> = [];
  recordingList: Array<string> = [];
  searchedArr: any = [];
  isSearching: boolean = false;
  originalArray: any = [];
  searchingKeyword: boolean = false;
  isLoading = false;
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
    if (this.searchValue.length > 0) {
      this.isListOpen = true;
    } else {
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
  isListOpen: boolean = false;
  searchRecordings(e) {
    if (this.searchValue.length > 0) {
      this.isListOpen = true;
    } else {
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
  loading: boolean = false;
  searchValue: string = '';
  filterRecordigns(e) {
    this.isssLoading = true;
    this.listOfRecording.searchedFor = this.searchingFor;
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
      this.router.navigate(['/admin/recordings']);
      this.isssLoading = false;
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
  fillValue(i){
    this.currentRole ='Choose authority';
    this.editUserFirstName = i.first_name;
    this.editUserLastName = i.last_name;
    this.editUserEmail = i.email;
    this.editUserStatus = i.status;
    this.editUserID = i.id;
    this.currentRole = i.role_id === 1 ? 'Admin' : i.role_id === 2 ? 'Manager' : 'Agent'
  }
  updateUser(){
    this.userFirstNameErr  = false;
      this.userSecNameErr  = false;
      this.userEmailErr  = false;
      this.userStatusErr  = false;
      this.userTeamErr  = false;
      this.userRoleErr  = false;
      if(!this.editUserFirstName){
        this.userFirstNameErr = true;
        return
      }
      if(!this.editUserLastName){
        this.userSecNameErr = true;
        return
      }
      if(!this.editUserEmail){
        this.userEmailErr = true;
        return
      }
      if(!this.validateEmail(this.editUserEmail)){
        this.userEmailErr = true;
        return
      }
      if(this.currentRole == 'Choose authority'){
        this.userRoleErr = true;
        return
      }
      // if(this.currentTeamID === '0'){
      //   this.userTeamErr = true;
      //   return
      // }
      this.userFirstNameErr  = false;
      this.userSecNameErr  = false;
      this.userEmailErr  = false;
      this.userStatusErr  = false;
      this.userTeamErr  = false;
      this.userRoleErr  = false;
      this.isUpdating = true;

      let obj = {
        "first_name": this.editUserFirstName,
        "last_name": this.editUserLastName,
        "email": this.editUserEmail,
        "group_id": this.currentTeamID,
        "status" : this.editUserStatus,
        "role": this.currentRole === 'Admin' ? 1 : ''  || this.currentRole === 'Manager' ? 2 : '' || this.currentRole === 'Agent' ? 3 : '',
    }
    this.profile.updateUser(obj, this.editUserID).subscribe(res=>{
      this.modalService.dismissAll();
      this.isUpdating = false;
      this.copyTeamDetail = this.copyTeamDetail.filter(item=>{
        if(item.id == this.editUserID){
          item.name = res.data.name;
          item.first_name = res.data.first_name;
          item.last_name = res.data.last_name;
          // item.email = res.data.email;
          item.status = res.data.status;
          item.role_id = res.data.role_id;
        }
        return item
      })
      this.loadPagination(this.copyTeamDetail)
      console.log(res);
    })

  }
  validateEmail(email){
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}
changeStatus(status: string, item){
  this.fillValue(item);
  this.editUserStatus = status;
  let obj = {
    "first_name": this.editUserFirstName,
    "last_name": this.editUserLastName,
    "email": this.editUserEmail,
    "group_id": this.currentTeamID,
    "status" : this.editUserStatus,
    "role": item.role_id,
}
this.profile.updateUser(obj, this.editUserID).subscribe(res=>{
  console.log(res);

})
}
teamNameErr
updateGroup(){
  this.teamNameErr = false;
    if(!this.updateGroupName){
      this.teamNameErr = true;
      return
    }
    this.teamNameErr = false;
    this.modalService.dismissAll();
    this.profile.updateGroup({  "name": this.updateGroupName}, this.currentTeamID).subscribe(res=>{
      if(res.status === 'success'){
        this.teamName = this.updateGroupName;
      }
      // this.updateGroupName = '';
      console.log(res);
    })
}
onChangeRole(e) {
  this.isDateDropdown8 = false;
  this.currentRole = e;
}
removeAllErrors(){
  this.userFirstNameErr  = false;
  this.userSecNameErr  = false;
  this.userEmailErr  = false;
  this.userStatusErr  = false;
  this.userTeamErr  = false;
  this.userRoleErr  = false;
  this.teamNameErr =  false
  this.userSecNameErr1 = false;
  this.userFirstNameErr1 = false;
  this.userEmailErr1 = false;
  this.isDateDropdown51  = false;
  this.userRoleErr1 = false;
  this.newUserFirstName1 = ''
  this.newUserSecName1 = ''
  this.newUserEmail1 = ''
  this.currentRole1 = 'Choose authority';
}
newUserFirstName1: string = ''
newUserSecName1: string = ''
newUserEmail1: string = ''
currentRole1: string = 'Choose authority';
userSecNameErr1: boolean = false;
userFirstNameErr1: boolean = false;
userEmailErr1: boolean = false;
isDateDropdown51 : boolean = false;
userRoleErr1 : boolean = false;
onChangeRole1(e) {
  this.isDateDropdown51 = false;
  this.currentRole1 = e;
}
addUserToTeam(){
      this.userFirstNameErr1  = false;
      this.userSecNameErr1  = false;
      this.userEmailErr1  = false;
      this.userRoleErr1  = false;
      if(!this.newUserFirstName1){
        this.userFirstNameErr1 = true;
        return
      }
      if(!this.newUserSecName1){
        this.userSecNameErr1 = true;
        return
      }
      if(!this.newUserEmail1){
        this.userEmailErr1 = true;
        return
      }
      if(!this.validateEmail(this.newUserEmail1)){
        this.userEmailErr1 = true;
        return
      }
      if(this.currentRole1 == 'Choose authority'){
        this.userRoleErr1 = true;
        return
      }
      if(this.currentTeamID == '0'){
        this.userTeamErr = true;
        return
      }
      this.userFirstNameErr  = false;
      this.userSecNameErr  = false;
      this.userEmailErr  = false;
      this.userRoleErr  = false;
      this.userTeamErr  = false;
  let obj = {
    "first_name": this.newUserFirstName1,
    "last_name": this.newUserSecName1,
    "email": this.newUserEmail1,
    "role": this.currentRole1 === 'Admin' ? 1 : ''  || this.currentRole1 === 'Manager' ? 2 : '' || this.currentRole1 === 'Agent' ? 3 : '',
    "group_id": this.currentTeamID
}
this.modalService.dismissAll();
this.profile.createUser(obj).subscribe(res=>{
  // this.copyTeams =  this.copyTeams.map(item =>{
  //    if(item.id === Number(res.data.groupId)){
  //        item.activeUsers++
  //        item.totalUsers++
  //    }
  //    return item;
  //  })
  this.teamdetail.push(res.data)
  this.copyTeamDetail.push(res.data);
  this.loadPagination(this.copyTeamDetail);
   console.log(res);
   this.currentTeamID = '0';
   this.currentRole1 = 'Choose authority';
 });
console.log(obj);
}
  ngOnDestroy(){
    this.profile.isProfileDetail.next(false)
    this.profile.currentTab = 1;
  }
}
