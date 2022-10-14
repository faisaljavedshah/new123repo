import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UNLINK {
  constructor(private router: Router, private http: HttpClient) {}
  CFAunLink(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post<any>(
      `${environment.apiUrl}/cfa/unlink`,

      {
        headers: headers
      }
    );
  }

  ZoomUnlink(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post<any>(
      `${environment.apiUrl}/zoom/unlink`,

      {
        headers: headers
      }
    );
  }


  RingUnlink(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post<any>(
      `${environment.apiUrl}/ringcentral/unlink`,

      {
        headers: headers
      }
    );
  }
}
