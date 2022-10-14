import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ForgotPasswordService {
  email = new BehaviorSubject<string>(undefined);
  vId = new BehaviorSubject<string>(undefined);
  parameters = new BehaviorSubject<any>(undefined);
  userInfo = new BehaviorSubject<any>(undefined);
  token : string = ''

  constructor(private http: HttpClient) {}
  confirmEmail(mail: string) {
    return this.http.post<any>(`${environment.apiUrl}/forgotpassword`, {
      email: mail,
    });
  }
  sendOTP(otp): Observable<any> {
    let email;
    this.email.subscribe((res) => {
      email = res;
    });
    return this.http.post<any>(`${environment.apiUrl}/forgotpassword`, {
      email: email,
      code: otp,
    });
  }
  resetPassword(newpassword: string): Observable<any> {
    let id;
    let userEmail;
    this.userInfo.subscribe((res) => {
      userEmail = res.username;
      id = res.id;
    });
    return this.http.post<any>(`${environment.apiUrl}/newPassword`, {
      password: newpassword,
      token: this.token,
      email: userEmail,
    });
  }

  getUserData(token: string): Observable<any>{
     return this.http.get<any>(`https://api.convirza.com/login/resetCheck/${token}`)
  }
}
