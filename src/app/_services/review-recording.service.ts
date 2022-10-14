import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReviewRecordingService {

  constructor(private http: HttpClient) { }

  recordingDetail(id:string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/recordings/public/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  markAsReview(formData): Observable<any>{
    return this.http.post<any>(
      `${environment.apiUrl}/public/requestreview`,
      formData
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
  reportAnIssue(formData): Observable<any>{
    const token =  localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post<any>(
      `${environment.apiUrl}/public/requestreview`,
      formData,
      {
        headers: headers,
      }
    );
  }
}
