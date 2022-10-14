import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class profileService {
  isProfileDetail  = new BehaviorSubject(false);
  currentTeam : any
  allTeam = new BehaviorSubject(undefined);
  public currentTab = 0;
  client: any;
  currentTimeZone: any;
  passwordpro: any;
  passwordnew: any;
  constructor(private http: HttpClient) {}
  profileService(): Observable<any> {
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.get<any>(`${environment.apiUrl}/profile`, {
      headers: headers,
    });
  }

  // Image Uploading call
  uploadImage(file): Observable<any> {
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    const formData = new FormData();
    if (file.avatar) {
      formData.append('avatar', file.avatar, 'file');
    }
    formData.append('name', file.name);
    formData.append('timezone', file.timezone)
    formData.append('status', file.status)
    formData.append('tzname', file.tzname)

    const obj: any = {
      avatar: formData,
      name: file.name,
    };
    // file.password !== '' ? formData.append('newPass', file.password) : '';
    return this.http.post<any>(`${environment.apiUrl}/profile`, formData, {
      headers: headers,
    });
  }

  fetchTeams(): Observable<any> {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.get(`${environment.apiUrl}/teams`);
  }

  fetchTeamUsers(){
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.get(`${environment.apiUrl}/teams/${this.currentTeam}/users`);
  }

  secondLevelUsers(id){
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post(`${environment.apiUrl}/teams/details`,{group_id : id}, {headers : headers});
  }

  createUser(userData): Observable<any>{
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post(`${environment.apiUrl}/teams/users`, userData, {headers : headers}).pipe(
      catchError(this.handleError)
    );
  }

  updateUser(userData, userId): Observable<any>{
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post(`${environment.apiUrl}/teams/users/${userId}`, userData, {headers : headers}).pipe(
      catchError(this.handleError)
    );
  }

  createTeam(userData): Observable<any>{
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post(`${environment.apiUrl}/teams`, userData, {headers : headers}).pipe(
      catchError(this.handleError)
    );
  }

  updateGroup(userData, groupId): Observable<any>{
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post(`${environment.apiUrl}/teams/${groupId}`, userData, {headers : headers}).pipe(
      catchError(this.handleError)
    );
  }

  updatePassword(old_password: string, new_password: string): Observable<any>{
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post(`${environment.apiUrl}/change/password`, {old_password, new_password}, {headers : headers})
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}
