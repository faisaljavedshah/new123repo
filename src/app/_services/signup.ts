import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';

import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { User } from '../_models/index';

@Injectable({ providedIn: 'root' })
export class signupService {
  private userSubject: BehaviorSubject<User>;
  email = new BehaviorSubject<string>(undefined);
  public user: Observable<User>;
  constructor(private router: Router, private http: HttpClient) {
    this.userSubject = new BehaviorSubject<User>(
      JSON.parse(localStorage.getItem('user'))
    );
    this.user = this.userSubject.asObservable();
  }

  public get userValue(): User {
    return this.userSubject.value;
  }

  signup(email: string, password: string) {
    return this.http.post<any>(`${environment.apiUrl}/signup`, {
      email,
      password,
    });
  }

  confirmEmail(mail: string) {
    return this.http.post<any>(`${environment.apiUrl}/signup/verify`, {
      email: mail,
    });
  }
  sendOTP(otp): Observable<any> {
    let email;
    this.email.subscribe((res) => {
      email = res;
    });
    return this.http.post<any>(`${environment.apiUrl}/signup/verify`, {
      email: email,
      code: otp,
    });
  }
}
