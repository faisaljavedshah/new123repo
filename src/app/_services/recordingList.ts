import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RecordingLists {
  state$ = new BehaviorSubject<any>(null);
  filterLists = new BehaviorSubject(undefined);
  groupDataLoading = new BehaviorSubject(undefined);
  isRecordingDetail = new BehaviorSubject(false);
  searchedFor : string
  searchedKeyword : string
  isAudioAccess : boolean
  changesStatus = new Subject();
  constructor(private http: HttpClient) {}
  recordingList(): Observable<any> {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.get<any>(`${environment.apiUrl}/recordings`, {headers: headers,});
  }

  updateTags(tags:any):Observable<any>{
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
      return this.http.post<any>(`${environment.apiUrl}/recordings/multiple`, tags, {
        headers: headers,
      })
  }

  shareEmails(emails:any):Observable<any>{
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
      return this.http.post<any>(`${environment.apiUrl}/recordings/share/info`, emails, {
        headers: headers,
      })
  }

  nextPayload(count):Observable<any>{
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    const params = new HttpParams().append('count', count);
    return this.http.get<any>(`${environment.apiUrl}/recordings`, {headers, params})
  }

  searchKeywords(word):Observable<any>{
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.get<any>(`${environment.apiUrl}/keywordsSearch/` + word, {headers : headers})
  }

  getSearchedArray(data):Observable<any>{
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post<any>(`${environment.apiUrl}/recordingsListFilter`,{type : data.type , filter : data.filter},  {headers : headers})

  }

  downloadInfo(data):Observable<any>{
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post<any>(`${environment.apiUrl}/recordings/download/info`, data,  {headers : headers})

  }

  FilterList(obj): Observable<any>{
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post<any>(`${environment.apiUrl}/recordingsListFilter`, obj,  {headers : headers})

  }

  Reprocess(obj:string): Observable<any>{
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post<any>(`${environment.apiUrl}/recordings/reprocess/${obj}`, {headers : headers})

  }
}
