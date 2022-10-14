import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  currentGroupNames : Array<string> | string = "all";
  totalUsers : number
  activeUsers : number
  userImages : Array<string> = []

  constructor(private http: HttpClient) { }

  getTeams(obj): Observable<any>{
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    // if(this.currentGroupNames){
          let newSelec = [];
      let group:any = JSON.parse(localStorage.getItem('groups'));
    // console.log(group);
    group.forEach(element => {
 
        newSelec.push(element.text)
      }
    );
    // console.log(newSelec)
  
      obj['group_id'] = JSON.parse(localStorage.getItem('Selected_Group')) ? JSON.parse(localStorage.getItem('Selected_Group')) : newSelec;
    // }
    console.log('Tab Payload', obj);
    return this.http.post<any>(
      `${environment.apiUrl}/teams/performance`,
      obj,
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
