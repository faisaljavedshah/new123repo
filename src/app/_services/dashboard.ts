import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashBoard {
  constructor(private http: HttpClient) {}
  currentGroupNames : Array<string> | string = "All";
  renderGroupData = new BehaviorSubject(undefined);
  groupDataLoading = new BehaviorSubject(undefined);
  currentDropdownItem : number = 0
  Dashboard(start, end): Observable<any> {
    this.start = start;
    this.end = end;
    let obj = {
      start_date: start,
      end_date: end,
    }
    // if(this.currentGroupNames){
      let data = JSON.parse(localStorage.getItem('Selected_Group'));
      if(data){
        obj['group_id'] = data
      }else{
        obj['group_id'] = 'All'
      }
    // }
    if(start === end){
      // return
    }
    console.log('Tab Payload', obj);
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post<any>(
      `${environment.apiUrl}/dashboard`,
      obj,
      {
        headers: headers,
      }
    );
  }
  start :any
  end : any
  getGroups(id): Observable<any> {
    let obj = {
      start_date: this.start,
      end_date: this.end,
      group_id : JSON.parse(localStorage.getItem('Selected_Group'))
    }
    console.log('Group Payload', obj);
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post<any>(
      `${environment.apiUrl}/dashboard`,
      obj,
      {
        headers: headers,
      }
    );
  }
  Today(Today): Observable<any> {
    this.start = Today;
    this.end = Today;
    let obj ={
      start_date: Today,
    }
    // if(this.currentGroupNames){
      let data = JSON.parse(localStorage.getItem('Selected_Group'));
      if(data){
        obj['group_id'] = data
      }else{
        obj['group_id'] = 'All'
      }
    // }
    console.log('Tab Payload', obj);
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post<any>(
      `${environment.apiUrl}/dashboard`,
      obj,
      {
        headers: headers,
      }
    );
  }
}
