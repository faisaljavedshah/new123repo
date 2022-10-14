import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdministratorService {

  constructor(private http : HttpClient) { }


  onSelectGroups(group : number):Observable<any>{
    const token = localStorage.getItem('admin_token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.get<any>(`${environment.apiUrl}/getouusers/${group}`,  {headers: headers,})

  }

  signIn(id : number):Observable<any>{
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post<any>(`${environment.apiUrl}/signinouuser`, {user_id : id} , {headers})
  }
}
