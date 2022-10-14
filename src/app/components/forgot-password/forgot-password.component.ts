import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ForgotPasswordService } from 'src/app/_services/forgot-password.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  text: string = '';
  Borderredd : boolean = false;
  isEmpty =true;
  loading = false;
  isValidEmail: boolean = false;
  isPasswordSent: boolean = false;
  constructor(private forgot: ForgotPasswordService, private route: Router) { }

  ngOnInit(): void {
  }

  onSend(){
    if(!this.validateEmail(this.text)){
      this.isValidEmail = true;
      this.Borderredd = true;
      return
  }
    this.loading = true;
    this.isValidEmail = false;
    this.forgot.confirmEmail(this.text).subscribe(data=>{
      this.loading = false;
      if(data.status === 'success'){
          this.forgot.email.next(this.text);
          this.isPasswordSent = true;
          // this.route.navigate(['/otp'], { skipLocationChange : true})
      }else{
        this.isValidEmail = true;
        this.Borderredd = true;
      }
    })
  }
  changePass(val){
    this.text = val;
  }
  validateEmail(email)
    {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }
    redirect(){
      this.route.navigate(['/login'])
    }
}
