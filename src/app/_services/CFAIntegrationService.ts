import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable,} from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CFA {
  constructor(private http: HttpClient) {}
  CFAintegration(start, end): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post<any>(
      `${environment.apiUrl}/cfa/fetchCalls`,
      {
        start_date: start,
        end_date: end
      },
      {
        headers: headers
      }
    );
  }

  ZOOMintegration(start, end): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post<any>(
      `${environment.apiUrl}/zoom/fetchCalls`,
      {
        start_date: start,
        end_date: end
      },
      {
        headers: headers
      }
    );
  }

  RINGintegration(start, end): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post<any>(
      `${environment.apiUrl}/ringcentral/fetchCalls`,
      {
        start_date: start,
        end_date: end
      },
      {
        headers: headers
      }
    );
  }
}
