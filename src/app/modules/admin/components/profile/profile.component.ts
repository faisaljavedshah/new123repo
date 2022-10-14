import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ModalDismissReasons,
  NgbModal,
  NgbModalRef
} from '@ng-bootstrap/ng-bootstrap';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { profileService } from 'src/app/_services/profile';
import { AuthenticationService } from 'src/app/_services';
import { FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { RecordingLists } from 'src/app/_services/recordingList';
import { CFA } from 'src/app/_services/CFAIntegrationService';
import { UNLINK } from 'src/app/_services/unLinkCfa';
import { debounceTime } from 'rxjs/operators';
import * as moment from 'moment';
import { LocationStrategy } from '@angular/common';
import { any } from '@amcharts/amcharts4/.internal/core/utils/Array';

declare var $: any;
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  public showwPassword: boolean;
  public showpPasswordd: boolean = false;
  disabled = 'isDisabled';
  submitted = false;
  ShowDiv: boolean = false;
  showpass: string = '';
  borrdered: boolean = false;
  isDateDropdown = false;
  isDateDropdown1 = false;
  isDateDropdown2 = false;
  isDateDropdown4 = false;
  isDateDropdown5 = false;
  currentRole = 'Choose authority';
  currentTimeZone = 'America/Denver';
  currentStatus = 'Online';
  currentLanguage = 'English US';
  currentmanager = '';
  isFieldopen = false;
  isbuttonopen = false;
  Buttonopen = false;
  Buttonopenn = false;
  Buttonopennn = false;
  Buttonopennnn = false;
  zoomLoading : boolean = false;
  ringLoading : boolean = false;
  oldPassword : boolean = false;
  setOldPassword: string = '';
  closeModal: string;
  currentTeamID : number = 0;
  currentTeamName : string = 'Choose team';
  selectedTeam : number = -1;
  profileData: any;
  currentTab = 0;
  fileToUpload: any;
  issloading: boolean = false;
  issPaginationDropdown: boolean = false;
  createTeam: boolean = false;
  createUser: boolean = false;
  isProgressBars: boolean = false;
  zoomCalendar : any
  ringCalendar : any

  // User info
  userName: string = '';
  userEmail: string = '';
  imageUrl: any = null;
  tzName: string = '';
  toggleProfile : boolean = false;
  scrollingPosition : number = 0;

  copyTeams : Array<any> = []
  availableTimeZones : Array<any> = [
    { value: 'America/Halifax', text: 'Atlantic (AT)' },
		{ value: 'America/New_York', text: 'Eastern (ET)' },
		{ value: 'America/Chicago', text: 'Central (CT)' },
		{ value: 'America/Denver', text: 'Mountain (MT)' },
		{ value: 'America/Phoenix', text: 'Arizona (MT)' },
		{ value: 'America/Los_Angeles', text: 'Pacific (PT)' },
  ]
  isAdmin: boolean=false;
  userData: any;
  closeResult: string;
  constructor(

    private router: Router,
    private modalService: NgbModal,
    private profileService: profileService,
    private authService: AuthenticationService,
    private elm: ElementRef,
    public listOfRecording: RecordingLists,
    private cfaIntegration: CFA,
    private cfaUnlink: UNLINK,
    private route: ActivatedRoute,
    private location: LocationStrategy
  ) {
    history.pushState(null, null, window.location.href);
    // check if back or forward button is pressed.
    this.location.onPopState(() => {
      this.profileService.isProfileDetail.next(false);
        history.pushState(null, null, window.location.href);
    });
  }
isAdminAccess : boolean = false;
  ngOnInit(): void {
    this.userData = JSON.parse(localStorage.getItem('userInfo')) || JSON.parse(sessionStorage.getItem('userInfo'));
    // conasole.log('this.userData',z)
    if(this.userData.img === null || !this.userData.img){
      this.userData.img = 'https://www.freepik.com/free-vector/businessman-character-avatar-isolated_6769264.htm#query=user&position=0&from_view=search';
    }
    if(localStorage.getItem('adminInfo')){
      this.isAdmin = true;
  }else{
    this.isAdmin =false;
  }
    let user = JSON.parse(localStorage.getItem('adminInfo'));
    if(user){
      if(user.admin === 1){
        this.isAdminAccess = true;
      }else this.isAdminAccess = false
    }
    let tab : string = ''
    this.route.queryParams
    .subscribe(params => {
      if(params.tab === 'integrations'){
        tab = params.tab;
      }
    });
    this.isLoading = true;
    this.profileService.profileService().subscribe(data => {
      if(tab === 'integrations'){
        this.currentTab = 2;
      }
      this.UserData = data;
      this.connected = data.data.user.cfa_connected;
      this.userId = data.data.user.userId;
      console.log('Profile',  data);
      this.profileData = data.data;
      this.currentStatus = data.data.user.status;
      this.userName = data.data.user.name;
      this.userEmail = data.data.user.email;
      this.imageUrl = data.data.user.image;
      this.currentTimeZone = data.data.user.timezone;
      this.CfaCallFetched = data.data.user.cfa_calls_fetched;

      this.Totalanalyzed = data.data.user.analyzed;
      this.Totaltranscription = data.data.user.transcribed;
      this.Totaluploaded = data.data.user.uploaded;

      this.zoomTotalanalyzed = data.data.user.zoom_analyzed;
      this.zoomTotaltranscription = data.data.user.zoom_transcribed;
      this.zoomTotaluploaded = data.data.user.zoom_uploaded;

      this.ringTotalanalyzed = data.data.user.ringcentral_analyzed;
      this.ringTotaltranscription = data.data.user.ringcentral_transcribed;
      this.ringTotaluploaded = data.data.user.ringcentral_uploaded;
      this.ringPercent();
      this.percent();
      this.zoomPercent();
      this.isLoading = false;
    },err =>{
      this.isLoading = false;
      console.log(err);
      alert(err);
    });
    this.currentTab = this.profileService.currentTab;
    if (this.currentTab === 1) {
      this.isButtonActive = true;
    }
    this.listOfRecording.recordingList().subscribe(d => {
      this.originalArray = d;
      this.agentList = d.data.agents;
      this.tagList = d.data.tags;
    });
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
    // this.profileService.fetchTeams().subscribe(res=>{
    //   console.log('Teams----------->', res);
    //   this.profileService.allTeam.next(res.data.teams);
    //   this.teamfluffy = res.data.teams;
    //   this.copyTeams = res.data.teams;
    //   this.loadPagination(this.teamfluffy);
    // },err => {
    //   console.log(err);
    //   this.isLoading= false;
    //   alert(err);

    // });
    this.profileService.isProfileDetail.subscribe(res=>{
      const container = document.getElementById('main-drawer');
      container.scrollTop = this.scrollingPosition;
      this.toggleProfile = res;
    })
  }

  managerNameList : Array<any> = ['David', 'Harry', 'Marley', 'Brook', 'Wisey', 'Tim cook', 'John marsh', 'Joshua']
  duplicateMangagers : Array<any> =['David', 'Harry', 'Marley', 'Brook', 'Wisey', 'Tim cook', 'John marsh', 'Joshua']
  teamfluffy = [];
  itemLength: number = 25;
  lowerLimit = 0;
  uppreLimit = 25;
  totalArraySize = 25;
  totalPageCounter = 1;
  currentPage = 1;
  newElementArray: any;

  loadPagination(e) {
    this.newElementArray = e;
    this.teamfluffy = this.copyTeams?.slice(this.lowerLimit, this.uppreLimit);
    this.totalArraySize = this.copyTeams?.length;
    this.totalPageCounter = Math.ceil(
      Math.abs(this.copyTeams?.length / this.itemLength)
    );
  }
  onNextPage() {
    let dar = document.getElementById('main-drawer');
    this.scrollToTop(dar);

    let upperLim: any;
    upperLim = this.uppreLimit;
    this.lowerLimit += this.itemLength;
    this.uppreLimit += this.itemLength;
    this.currentPage++;

    if (
      this.uppreLimit > this.copyTeams.length &&
      upperLim >= this.copyTeams.length
    ) {
      this.lowerLimit -= this.itemLength;
      this.uppreLimit -= this.itemLength;
      this.currentPage--;
      return;
    }
    this.loadPagination(this.copyTeams);
  }
  onPrevPage() {
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
    this.loadPagination(this.copyTeams);
  }
  activeNumber = 25;
  changeItemLength(e) {
    this.issPaginationDropdown = false;
    this.totalPageCounter = 1;
    this.currentPage = 1;
    this.lowerLimit = 0;
    this.uppreLimit = Number(e);
    this.itemLength = Number(e);
    this.loadPagination(this.copyTeams);
  }

  // Go to - Page

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
      this.teamfluffy = this.copyTeams.slice(lower, upper);
      // this.loadPagination()
        this.currentPage = e;
        this.lowerLimit = lower;
        this.uppreLimit = upper;
    }
  }
  public testCall(){
    console.log('hello pakistan')
    alert("I am here..");
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
  onSearchManagers(e:string){
      let keyword = e.toLowerCase();
      this.managerNameList = this.duplicateMangagers.filter(item =>{
        let i = item.slice(0, keyword.length).toLowerCase();
        if (i === keyword) {
          return item;
        }
      })
  }
  isLoading: boolean = false;
  testForm: FormGroup;
  date: any;
  date1: any;
  connected: any;
  userId: any;
  widthT: any;
  widthA: any;
  widthU: any;
  widthP: any;

  zoomWidthT: any;
  zoomWidthA: any;
  zoomWidthU: any;
  zoomWidthP: any;

  ringWidthT: any;
  ringWidthA: any;
  ringWidthU: any;
  ringWidthP: any;
  CfaCallFetched: any;

  Totalanalyzed: any;
  Totaltranscription: any;
  Totaluploaded: any;
  ToralProcessing: any;
  zoomTotalanalyzed: any;
  zoomTotaltranscription: any;
  zoomTotaluploaded: any;
  zoomTotalProcessing: any;
  ringTotalanalyzed: any;
  ringTotaltranscription: any;
  ringTotaluploaded: any;
  ringTotalProcessing: any;
  @ViewChild('issueReported') issueReported: ElementRef;
  modalReference: NgbModalRef;

  SubmitModal(content) {
    this.modalReference = this.modalService.open(content, {
      size: 'sm',
      centered: true
    });
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
  percent() {
    let totalCalls = this.Totaluploaded;
    let totalUPLOADE = this.Totaluploaded;
    let totalAlalyze = this.Totalanalyzed;
    let totalTranscribe = this.Totaltranscription;

    let processing = totalUPLOADE - totalTranscribe;
    this.ToralProcessing = processing;
    let equalUploaded = (totalUPLOADE / totalCalls) * 100;
    let equalProcessing = (processing / totalCalls) * 100;

    let equlaTranscribed = (totalTranscribe / totalCalls) * 100;
    this.widthU = equalUploaded + '%';
    this.widthP = equalProcessing + '%';
    this.widthT = equlaTranscribed + '%';
  }
  zoomPercent(){
    let totalCalls = this.zoomTotaluploaded;
    let totalUPLOADE = this.zoomTotaluploaded;
    let totalAlalyze = this.zoomTotalanalyzed;
    let totalTranscribe = this.zoomTotaltranscription;

    let processing = totalUPLOADE - totalTranscribe;
    this.zoomTotalProcessing = processing;
    let equalUploaded = (totalUPLOADE / totalCalls) * 100;
    let equalProcessing = (processing / totalCalls) * 100;

    let equlaTranscribed = (totalTranscribe / totalCalls) * 100;
    this.zoomWidthU = equalUploaded + '%';
    this.zoomWidthP = equalProcessing + '%';
    this.zoomWidthT = equlaTranscribed + '%';
  }
  logOut(): void {
    this.authService.logout();
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
  ringPercent(){
    let totalCalls = this.ringTotaluploaded;
    let totalUPLOADE = this.ringTotaluploaded;
    let totalAlalyze = this.ringTotalanalyzed;
    let totalTranscribe = this.ringTotaltranscription;

    let processing = totalUPLOADE - totalTranscribe;
    this.ringTotalProcessing = processing;
    let equalUploaded = (totalUPLOADE / totalCalls) * 100;
    let equalProcessing = (processing / totalCalls) * 100;

    let equlaTranscribed = (totalTranscribe / totalCalls) * 100;
    this.ringWidthU = equalUploaded + '%';
    this.ringWidthP = equalProcessing + '%';
    this.ringWidthT = equlaTranscribed + '%';
  }
  UserData : any

  ImportClick() {
    this.cfaIntegration.CFAintegration(this.start, this.end).subscribe(d => {
      if(d.status === 'success'){
      this.SubmitModal(this.issueReported);
      this.CfaCallFetched = true;
    }
    });
  }
  importZoom() {
    this.cfaIntegration.ZOOMintegration(this.zoomStart, this.zoomEnd).subscribe(d => {
      if(d.status === 'success'){
        this.SubmitModal(this.issueReported);
        this.UserData.data.user.zoom_connected = true;
        this.UserData.data.user.zoom_calls_fetched = true;
      }
    });
  }
  openModal(content) {
    console.log(content)
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
    windowClass: 'Group-Modals'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReasonCh(reason)}`;
    });
  }

  getDismissReasonCh(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  importRING() {
    this.cfaIntegration.RINGintegration(this.ringStart, this.ringEnd).subscribe(d => {
      if(d.status === 'success'){
        this.SubmitModal(this.issueReported);
        this.UserData.data.user.ringcentral_connected = true;
        this.UserData.data.user.ringcentral_calls_fetched = true;
      }
    });
  }
  unLink() {
    this.issloading = true;
    this.cfaUnlink.CFAunLink().subscribe(d => {
      this.connected = false;
      this.issloading = false;
      this.CfaCallFetched = false;
      this.UserData.data.user.cfa_calls_fetched = false;
      this.UserData.data.user.cfa_connected = false;
    });
  }
  unLinkZoom() {
    this.zoomLoading = true;
    this.cfaUnlink.ZoomUnlink().subscribe(d => {
      this.UserData.data.user.zoom_calls_fetched = false;
      this.UserData.data.user.zoom_connected = false;
      this.zoomLoading = false;
    });
  }
  unLinkRing() {
    this.ringLoading = true;
    this.cfaUnlink.RingUnlink().subscribe(d => {
      this.UserData.data.user.ringcentral_calls_fetched = false;
      this.UserData.data.user.ringcentral_connected = false;
      this.ringLoading = false;
    });
  }

  // connectedImport;
  start: any;
  end: any;
  selectedDouble: any;
  zoomStart : any
  zoomEnd : any
  ringStart : any
  ringEnd : any
  CFACalValue(e) {
    if(e.startDate){
      this.start = moment(new Date(e.startDate._d)).format('MM/DD/YYYY');
      this.end = moment(new Date(e.endDate._d)).format('MM/DD/YYYY');
    }
  }
  zoomCalValue(e){
    if(e.startDate){
      this.zoomStart = moment(new Date(e.startDate._d)).format('MM/DD/YYYY');
      this.zoomEnd = moment(new Date(e.endDate._d)).format('MM/DD/YYYY');
    }
  }
  ringCalValue(e){
    if(e.startDate){
      this.ringStart = moment(new Date(e.startDate._d)).format('MM/DD/YYYY');
      this.ringEnd = moment(new Date(e.endDate._d)).format('MM/DD/YYYY');
    }
  }
  onBackpress() {
    this.router.navigateByUrl('/admin/home');
  }
  // myVal: number = 0;
  // openCalendar() {
  //   if (this.myVal === 0) {
  //     $(function() {
  //       $('input[name="datefilter"]').daterangepicker({
  //         autoUpdateInput: false,
  //         linkedCalendars: false,
  //         opens: 'left',
  //         drops: 'auto',
  //         locale: {
  //           cancelLabel: 'Clear'
  //         }
  //       });

  //       $('input[name="datefilter"]').on('apply.daterangepicker', function(
  //         ev,
  //         picker
  //       ) {
  //         $(this).val(
  //           picker.startDate.format('MM/DD/YYYY') +
  //             ' - ' +
  //             picker.endDate.format('MM/DD/YYYY')
  //         );
  //         // ev.target.classList.add('active_check');
  //         // $('#mainTab')[0].classList.add('testingclass');
  //       });

  //       $('input[name="datefilter"]').on('cancel.daterangepicker', function(
  //         ev,
  //         picker
  //       ) {
  //         $(this).val('Date range');
  //         picker.setStartDate(new Date());
  //         picker.setEndDate(new Date());
  //         // picker.startDate = null;
  //         // $('#mainTab')[0].classList.remove('testingclass');
  //       });
  //     });
  //     this.myVal++;
  //   }
  // }
  // triggerCalendar() {
  //   $('input[name="datefilter"]').daterangepicker({
  //     autoUpdateInput: false,
  //     linkedCalendars: false,
  //     opens: 'left',
  //     drops: 'auto',
  //     locale: {
  //       cancelLabel: 'Clear'
  //     }
  //   });
  // }
  triggerModal(content) {
    this.modalService
      .open(content, {
        ariaLabelledBy: 'modal-basic-title',
        windowClass: 'Team-Modals'
      })
      .result.then(
        res => {
          this.closeModal = `Closed with: ${res}`;
        },
        res => {
          this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
        }
      );
  }
  private getDismissReason(reason: any): string {
    this.removeAllErrors();
    this.createTeam = false;
    this.createUser = false;
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  changePassword(val) {
    this.showpass = val;
  }
  onChangeZone(e) {
    this.isDateDropdown = false;
    this.currentTimeZone = e;
  }
  onChangeStatus(e) {
    this.isDateDropdown1 = false;
    this.currentStatus = e;
  }
  onChangeLang(e) {
    this.isDateDropdown2 = false;
    this.currentLanguage = e;
  }
  onChangeLangg(e) {
    this.isDateDropdown4 = false;
    this.currentTeamID = e;
  }
  onChangeRole(e) {
    this.isDateDropdown5 = false;
    this.currentRole = e;
  }
  onChangeeRole(e) {
    this.isDateDropdown5 = false;
    this.currentmanager = e;
  }
  buttonClicked() {
    alert('Icon Clicked');
  }

  imageClicked(): void {
    alert('Image Clicked');
  }
  OnShow(): void {
    this.ShowDiv = true;
  }
  testOriginall: any = '';
  testOriginall1: any = '';
  rowwClicked(i) {
    const container = document.getElementById('main-drawer');
    this.scrollingPosition = container.scrollTop;
    this.profileService.currentTeam = i;
    this.profileService.isProfileDetail.next(true);
    // this.router.navigateByUrl('/admin/profile/profiledetail');
    // this.router.navigate(['/admin/profile/profiledetail']);
  }
  searchClicked() {
    alert('Search Clicked');
  }
  isButtonActive: boolean = false;
  onChange(event: MatTabChangeEvent) {
    this.profileService.currentTab = event.index;
    const tab = event.tab.textLabel;
    if (tab === 'Teams') {
      this.isButtonActive = true;
    } else {
      this.isButtonActive = false;
    }
  }
  handleFileInput(file: any) {
    this.fileToUpload = <File>file.target.files[0];
    let reader = new FileReader();
    reader.onload = (event: any) => {
      this.imageUrl = event.target.result;
    };
    reader.readAsDataURL(this.fileToUpload);
  }
  isSamePasswords: boolean = false;
  isPasswordValid: boolean = false;
  isOldPasswordInvalid: boolean = false;

  onUpload() {
    this.issloading = false;
    const userInfo = {
      name: this.userName,
      email: this.userEmail,
      avatar: this.fileToUpload,
      tzname: this.currentTimeZone,
      timezone: this.currentTimeZone,
      status: this.currentStatus
    };
    this.issloading = true;
    this.profileService.uploadImage(userInfo).subscribe(
      (event: any) => {
        this.issloading = false;
        if(event.status === 'success'){
          this.modalText = 'The Profile has been updated'
          this.onOpenToast();

          this.changepassOutside();
          // this.profileData = event
          this.profileData.user.status = event.data.status;
          this.profileData.user.timezone = event.data.timezone;
          this.isFieldopen = false;
          // window.location.reload();
          localStorage.setItem(
            'userInfo',
          JSON.stringify({
            name: event.data.name,
            img: event.data.avatar,
            status: this.currentStatus
          })
          );
          this.authService.userInfo.next({
            name: event.data.name,
            img: event.data.avatar,
            status: this.currentStatus
          });
          this.userData = JSON.parse(localStorage.getItem('userInfo')) || JSON.parse(sessionStorage.getItem('userInfo'));
          console.log('this.userData',this.userData)
          if(this.userData.img === null || !this.userData.img){
            this.userData.img = 'https://www.freepik.com/free-vector/businessman-character-avatar-isolated_6769264.htm#query=user&position=0&from_view=search';
          }
          this.issloading = false;
        }else{
          alert(event.message)
        }
      },
      error => {
        console.log(error);
      }
    );

    // this.isFieldopen  = false;
    // this.changepassOutside();
  }
  validatePassword(password) {
    var re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&=,./;:'"#^`~><|{}+)(_-])[A-Za-z\d@$!%*?&=,./;:`~'"#^><|{}+)(_-]{8,15}$/;
    return re.test(password);
  }
  enterName(e) {
    this.userName = e;
  }
  // goTo(e) {
  //   // this.elm.nativeElement.querySelector('#paginationInput').blur();
  //   // let tar = this.elm.nativeElement.querySelector('#target');
  //   // this.scrollToTop(tar);

  //   // this.scrollToTop(target)
  //   if (e <= this.totalPageCounter) {
  //     if (e == 1) {
  //       // this.changeItemLength(this.itemLength);
  //       return;
  //     }
  //     let upper = this.itemLength * Number(e);
  //     let lower = upper - this.itemLength;
  //   }
  // }
  isUpdatingPassword : boolean = false
  onChangePassword(){
    this.isSamePasswords = false;
    this.isOldPasswordInvalid = false
    this.isPasswordValid = false;
    if (this.setOldPassword.length > 0 || this.testOriginall.length > 0 || this.testOriginall.length > 0) {
      if(this.setOldPassword !== localStorage.getItem('pass')){
        this.isOldPasswordInvalid = true;
        return
      }
      if(this.testOriginall.length < 8){
        this.isSamePasswords = true;
        this.borrdered = true;
        return
      }
      if (this.testOriginall !== this.testOriginall1) {
        this.isPasswordValid = true;
        this.borrdered = true;
        return;
      }
    }else{
      return
    }
    this.isUpdatingPassword = true
    this.borrdered = false;
    this.isPasswordValid = false;

    this.profileService.updatePassword(this.setOldPassword, this.testOriginall).subscribe(res=>{
      this.isUpdatingPassword = false;
      if(res.status === 'success'){
        this.modalService.dismissAll();
        this.testOriginall = '';
        this.testOriginall1 = '';
        this.setOldPassword = '';
        this.isOldPasswordInvalid = false;
        this.isSamePasswords = false;
        this.borrdered = false;
        this.isPasswordValid = false;
        this.modalText = 'The Password has been updated'
        this.onOpenToast();
      }else{
        alert(res.message)
      }
    }, err=>{
      alert(err)
    })
  }
  modalText : string = ''
  isToastActive : boolean = false;
  onToastClose(){
    this.isToastActive = false;
  }
  onOpenToast(){
    this.isToastActive = true;
    setTimeout(() => {
      this.isToastActive = false;
    }, 5000);
  }
  discardall() {
    this.oldPassword = false;
    this.isOldPasswordInvalid = false;
    this.setOldPassword = '';
    this.userName = this.profileData?.user?.name;
    this.fileToUpload = this.profileData?.imageUrl;
    this.currentStatus = this.profileData?.user.status;
    this.testOriginall = '';
    this.testOriginall1 = '';
    this.currentLanguage = 'English US';
    this.currentTimeZone = this.profileData?.user?.timezone;
    this.borrdered = false;
    this.isSamePasswords = false;
    this.isPasswordValid = false;
    this.isFieldopen = false;
  }

  validateNumber(event) {
    const keyCode = event.keyCode;

    const excludedKeys = [8, 37, 39, 46];

    if (
      (keyCode >= 48 && keyCode <= 57) ||
      (keyCode >= 96 && keyCode <= 105 && excludedKeys.includes(keyCode))
    ) {
      event.preventDefault();
    }
  }
  nullfields() {
    this.testOriginall = '';
    this.testOriginall1 = '';
    this.borrdered = false;
    this.isSamePasswords = false;
    this.isPasswordValid = false;
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
      this.router.navigate(['/admin/recordings']);
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
  changepassOutside() {
    // if(this.setOldPassword.length === 0){
    //   if (!this.isSamePasswords || this.isPasswordValid) {
    //     this.isFieldopen = true;
    //   } else {
    //     this.isFieldopen = false;
    //   }
    //   this.isOldPasswordInvalid = false
    // }
    this.isFieldopen = false;
  }
  newUserFirstName : string = '';
  newUserSecName : string = '';
  newUserEmail : string = '';
  newUserRole : string = '';
  newUserTeam : string = '';

  // For Errors
  userFirstNameErr : boolean = false;
  userSecNameErr : boolean = false;
  userEmailErr : boolean = false;
  userRoleErr : boolean = false;
  userTeamErr : boolean = false;

  creatUser(){
    this.userFirstNameErr  = false;
      this.userSecNameErr  = false;
      this.userEmailErr  = false;
      this.userRoleErr  = false;
      this.userTeamErr  = false;
      if(!this.newUserFirstName){
        this.userFirstNameErr = true;
        return
      }
      if(!this.newUserSecName){
        this.userSecNameErr = true;
        return
      }
      if(!this.newUserEmail){
        this.userEmailErr = true;
        return
      }
      if(!this.validateEmail(this.newUserEmail)){
        this.userEmailErr = true;
        return
      }
      if(this.currentRole == 'Choose authority'){
        this.userRoleErr = true;
        return
      }
      if(this.currentTeamID === 0){
        this.userTeamErr = true;
        return
      }
      this.userFirstNameErr  = false;
      this.userSecNameErr  = false;
      this.userEmailErr  = false;
      this.userRoleErr  = false;
      this.userTeamErr  = false;
      let obj = {
        "first_name": this.newUserFirstName,
        "last_name": this.newUserSecName,
        "email": this.newUserEmail,
        "role": this.currentRole === 'Admin' ? 1 : ''  || this.currentRole === 'Manager' ? 2 : '' || this.currentRole === 'Agent' ? 3 : '',
        "group_id": this.currentTeamID
    }
    this.modalService.dismissAll();
      this.profileService.createUser(obj).subscribe(res=>{
       this.copyTeams =  this.copyTeams.map(item =>{
          if(item.id === Number(res.data.groupId)){
              item.activeUsers++
              item.totalUsers++
          }
          return item;
        })
        this.loadPagination(this.copyTeams)
        console.log(res);

        this.currentTeamName = 'Choose team';
        this.currentTeamID = 0;
        this.currentRole = 'Choose authority';
      });
  }

  teamName : string = ''

  teamNameErr : boolean = false;

  createUserTeams(){
    this.teamNameErr = false;
    if(!this.teamName){
      this.teamNameErr = true;
      return
    }
    this.teamNameErr = false;
    this.modalService.dismissAll();
    this.profileService.createTeam({  "name": this.teamName}).subscribe(res=>{
      this.copyTeams.push(res.data);
      this.loadPagination(this.copyTeams);
      this.teamName = '';
      console.log(res);

    })
  }
  validateEmail(email){
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}
removeAllErrors(){
  this.teamNameErr = false;
  this.userFirstNameErr  = false;
  this.userSecNameErr  = false;
  this.userEmailErr  = false;
  this.userRoleErr  = false;
  this.userTeamErr  = false;
  this.teamName = '';
  this.newUserFirstName = ''
this.newUserSecName = ''
this.newUserEmail = ''
this.currentRole = 'Choose authority';
this.currentTeamName  = 'Choose team'
}
  ngOnDestroy(){
    this.profileService.currentTab = 0;
  }
}
function dismiss(arg0: string) {
  throw new Error('Function not implemented.');
}

