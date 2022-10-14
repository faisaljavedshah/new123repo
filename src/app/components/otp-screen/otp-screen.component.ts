import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Config } from 'ng-otp-input/lib/models/config';
import { ForgotPasswordService } from 'src/app/_services/forgot-password.service';

@Component({
  selector: 'app-otp-screen',
  templateUrl: './otp-screen.component.html',
  styleUrls: ['./otp-screen.component.scss']
})
export class OtpScreenComponent implements OnInit {
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
  onOtpChange(otp) {
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
  constructor(public forgot: ForgotPasswordService,private router : Router){}
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
    this.forgot.sendOTP(this.otp).subscribe(res=>{
      if(res?.status === "success"){
        let email:any ;
        this.forgot.vId.next(res.data.verification_id);
        this.forgot.email.subscribe(d=>{
          email = d
        })
        this.router.navigate(['newpass'], {queryParams : {id : res.data.verification_id, email : email}, skipLocationChange : true});
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
