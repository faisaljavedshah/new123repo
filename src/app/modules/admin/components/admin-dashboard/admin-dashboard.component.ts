import { Component, ElementRef, OnInit } from '@angular/core';
import { RecordingLists } from 'src/app/_services/recordingList';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  constructor(private listofrecording : RecordingLists) {}

  ngOnInit(): void {}
  sideBarOpen = true;
  toggleWidth = false;

  sideBarToggler() {
    this.sideBarOpen = !this.sideBarOpen;
  }

  changeWidth(e) {
    this.toggleWidth = !this.toggleWidth;
  }
  checkScreen(){
    let detailpage : boolean
    this.listofrecording.isRecordingDetail.subscribe(res=>{
      detailpage = res;
    })
    if(window.location.pathname === "/admin/recordings" && detailpage){
      return true
    }else{
      return false;
    }
  }
}
