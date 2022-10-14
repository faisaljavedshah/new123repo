import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../_models/index';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class updateRecordingDetails {
  public user: Observable<User>;
  constructor(private router: Router, private http: HttpClient) {}

  recordingDetailUpdate(content, note) {
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');
    const UID = localStorage.getItem('uId').replace('/', '~-~');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post<any>(
      `${environment.apiUrl}/recordings/` + UID,
      {
        notes: note,
        tags: content,
      },
      {
        headers: headers,
      }
    ).pipe(
      catchError(this.handleError)
    );
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
