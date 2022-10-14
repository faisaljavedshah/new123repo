import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Config } from 'ng-otp-input/lib/models/config';
import { signupService } from '../../_services/index';

@Component({
  selector: 'app-otp-signup',
  templateUrl: './otp-signup.component.html',
  styleUrls: ['./otp-signup.component.scss']
})
export class OtpSignupComponent implements OnInit {
  otp: string = '';
  showOtpComponent = true;
  isborderred : boolean = false;
  @ViewChild('ngOtpInput', { static: false}) ngOtpInput: any;
  config :Config = {
    allowNumbersOnly: false,
    length: 6,
    isPasswordInput: false,
    disableAutoFocus: false,
    placeholder: '-',
    inputStyles: {
      'width': '40px',
      'height': '40px',
      'border': 'none',
      'box-shadow': '0px 1px 2px rgba(50, 50, 71, 0.08), 0px 0px 1px rgba(50, 50, 71, 0.2)',
      'outline-color' : '#2999FD',
      'border-radius' : '10px',
      'font-size' : '13px'
    }
  };
  onOtpChange(otp:any) {
    this.otp = otp;
  }

  setVal(val) {
    this.ngOtpInput.setValue(val);
  }

  toggleDisable(){
    if(this.ngOtpInput.otpForm){
      if(this.ngOtpInput.otpForm.disabled){
        this.ngOtpInput.otpForm.enable();
      }else{
        this.ngOtpInput.otpForm.disable();
      }
    }
  }

  onConfigChange() {
    this.showOtpComponent = false;
    this.otp = null;
    setTimeout(() => {
      this.showOtpComponent = true;
    }, 0);
  }
  constructor(public signup : signupService, private router : Router){}
  ngOnInit(): void {
  }
  isWrongOPT : boolean = false;
  isLoading : boolean = false;
  redirect(){
    if(this.otp.length < 6){
      alert('Please enter valid OTP.')
      this.isWrongOPT = true;
      return
    }
    this.isLoading = true;
    this.isWrongOPT = false;
    this.signup.sendOTP(this.otp).subscribe(res=>{
      if(res?.status === "success"){
        this.router.navigate(['last-signup'], { skipLocationChange : true});
        this.isLoading = false;
      }else{
        this.isborderred = true;
        this.isWrongOPT = true;
        this.isLoading = false;
      }
    })
  }
  change(val:any){
    this.otp = val;
  }
}
