import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { User } from '../_models/index';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  public userSubject: BehaviorSubject<User>;
  public user: Observable<User>;
  public storage: boolean = false;
  public userInfo = new BehaviorSubject<any>(undefined);
  // constructor(private router: Router, private http: HttpClient) {
  //   this.userSubject = new BehaviorSubject<User>(
  //     JSON.parse(localStorage.getItem('user'))
  //   );
  //   this.user = this.userSubject.asObservable();
  // }

  // public get userValue(): User {
  //   return this.userSubject.value;
  // }

  // login(email: string, password: string) {
  //   return this.http
  //     .post<any>(`${environment.apiUrl}/api/authaccount/login`, {
  //       email,
  //       password,
  //     })
  //     .pipe(
  //       map((user) => {
  //         console.log('====>user', user);
  //         // store user details and basic auth credentials in local storage to keep user logged in between page refreshes
  //         user.authdata = window.btoa(email + ':' + password);
  //         localStorage.setItem('user', JSON.stringify(user));
  //         this.userSubject.next(user);
  //         return user;
  //       })
  //     );
  // }

  // logout() {
  //   // remove user from local storage to log user out
  //   localStorage.removeItem('user');
  //   this.userSubject.next(null);
  //   this.router.navigate(['/login']);
  // }

  constructor(private router: Router, private http: HttpClient) {
    this.userSubject = new BehaviorSubject<User>(
      JSON.parse(localStorage.getItem('user'))
    );
    this.user = this.userSubject.asObservable();
  }

  getToken(): string | null {
    // if(this.storage){
    //   return localStorage.getItem('token');
    // }else{
    //   return sessionStorage.getItem('token');
    // }

    return localStorage.getItem('token');
  }
  getAdminToken(): string | null {
    return localStorage.getItem('admin_token');
  }

  isLoggedIn() {
    return this.getToken() != null;
  }
  isAdminLoggedIn() {
    return this.getAdminToken() != null;
  }

  logout() {
    // localStorage.removeItem('user');
    // localStorage.removeItem('email');
    // localStorage.removeItem('pass');
    // localStorage.removeItem('token');
    // // sessionStorage.removeItem('token');
    // // sessionStorage.removeItem('user');
    // localStorage.removeItem('uId');
    // localStorage.removeItem('userInfo');
    // localStorage.removeItem('selectedNodes');
    // localStorage.removeItem('Selected_Group');
    localStorage.clear();
    this.userSubject.next(null);
    this.storage = false;
    this.router.navigate(['login']);
  }
  public get userValue(): User {
    return this.userSubject.value;
  }
  login(email: string, password: string) {
    return this.http
      .post<any>(`${environment.apiUrl}/login`, {
        email,
        password
      })
      .pipe(
        map(user => {
          console.log('====>', user);
          // this.userInfo.next({userName : user.data.user.name, userImg : user.data.user.image})
          // console.log(this.userInfo.subscribe());

          // store user details and basic auth credentials in local storage to keep user logged in between page refreshes
          user.authdata = window.btoa(email + ':' + password);
          // if (this.storage) {
            if(user.data.admin === 1){
              localStorage.setItem('admin_token', user.data.access_token);
              localStorage.setItem('token', user.data.access_token);
            }else{
              localStorage.setItem('user', JSON.stringify(user));
              localStorage.setItem('token', user.data.access_token);
            }
          // } else {
          //   sessionStorage.setItem('user', JSON.stringify(user));
          //   sessionStorage.setItem('token', user.data.access_token);
          // }
          this.userSubject.next(user);
          return user;
        })
      );
  }
}
