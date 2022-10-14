import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GroupsUsersService {

  constructor(private http: HttpClient) { }

  deletingInfo(id:number){
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post(`${environment.apiUrl}/teams/delete/info`,{id : id}, {headers : headers});
  }

  deletingGroup(id:number){
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post(`${environment.apiUrl}/delete/teams`,{id : id}, {headers : headers});
  }

  deletingUser(id:number){
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post(`${environment.apiUrl}/delete/user`,{id : id}, {headers : headers});
  }

  permittedUser(id:number){
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post(`${environment.apiUrl}/teams/users/permissions`,{id}, {headers : headers});
  }

  updatePermission(obj : any){
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post(`${environment.apiUrl}/teams/users/permissions/update`,obj, {headers : headers});
  }

  subGroupFilter(obj : any){
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post(`${environment.apiUrl}/teams/list/filter`,obj, {headers : headers});
  }

  userFilter(obj : any){
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post(`${environment.apiUrl}/teams/users/list/filter`,obj, {headers : headers});
  }

  resetPassword(obj : any){
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post(`${environment.apiUrl}/teams/users/update/password`, obj, {headers : headers});
  }

  deactivateUser(id : number, status : string){
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post(`${environment.apiUrl}/teams/users/deactivate/${id}`, {status} , {headers : headers});
  }

  getCSVData(obj : any){
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + token);
    return this.http.post(`${environment.apiUrl}/teams/filter/performance`, obj, {headers : headers});
  }
}
