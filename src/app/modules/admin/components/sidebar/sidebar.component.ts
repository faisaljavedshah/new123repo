import { style } from '@angular/animations';
import {
  Component,
  EventEmitter,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { filter } from 'rxjs/operators';
import { AuthenticationService } from '../../../../_services/authentication.service';
import { RecordingLists } from 'src/app/_services/recordingList';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnChanges {
  value = '/assets/search_profile.svg';
  status = false;
  isAdmin : boolean = false;
  accessToken : string = ''
  constructor(private auth: AuthenticationService,public listOfRecording: RecordingLists,private router : Router) {}
  toggleNavbar: boolean = true;
  // @HostBinding("style.--width") width: string = '';
  @Output() sidenavToggle: any = new EventEmitter();
   userData : any ;
   userlogo : any;
   userRole : number
  ngOnInit(): void {
    this.accessToken = localStorage.getItem('athena_access_token');
    let user = JSON.parse(localStorage.getItem('user'));
    this.userRole = user.data.user.role;
    if(localStorage.getItem('adminInfo')){
        this.isAdmin = true;
    }else{
      this.isAdmin =false;
    }
    this.auth.userInfo.subscribe(data=>{
      if(data){
        this.userData = data;
      }
    })
    this.userData = JSON.parse(localStorage.getItem('userInfo')) || JSON.parse(sessionStorage.getItem('userInfo'));
    if(this.userData.img === null || !this.userData.img){
      this.userData.img = 'https://www.freepik.com/free-vector/businessman-character-avatar-isolated_6769264.htm#query=user&position=0&from_view=search';
    }
    // this.listOfRecording.recordingList().subscribe(d=>{
    //   this.userlogo = d.data.logo;
    // })
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
  }
  bellIconPress() {
    alert('Notification Icon Clicked');
  }

  logOut(): void {
    this.auth.logout();
  }

  sidebarToggle() {
    this.toggleNavbar = !this.toggleNavbar;
    this.sidenavToggle.emit(this.toggleNavbar);
    // this.width = '30%'
  }
  updateImage() {
    this.status = !this.status;
    if (this.status) //active status
     this.value = '/assets/settin.svg';
    // else this.value = '/assets/search_profile.svg';
  }
  fillWhite = ''
  changeColorWhite(){
this.fillWhite = 'fillWhite'
  }
  changeColorGray(){
    this.fillWhite = ''
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

}
