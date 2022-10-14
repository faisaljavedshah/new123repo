import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AuthenticationService } from '../../_services/index';
// import { AthenaService } from '@convirza/athena';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  checkDomain='';
  password: string = '';
  public showPassword: boolean;
  testOriginal: any = '';
  disabled = 'isDisabled';
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  error = '';
  lengthError: boolean = false;
  rememberMe : boolean = false;
  redirecting : boolean = false;
  @ViewChild('inputmail') email
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,
    // private athenaService: AthenaService
  ) {
    let email = localStorage.getItem('email');
    let pass = localStorage.getItem('pass');
    let token = localStorage.getItem('token');
    let admin_token = localStorage.getItem('admin_token');
    if(admin_token === token && email && pass){

      this.router.navigate(['/administrator']);
      return
    }
    if(email && pass && token){
      this.router.navigate(['/admin']);
    }else{
      this.redirecting = true;
    }
  }

  ngOnInit(): void {

    this.checkDomain = window.location.hostname
    this.loginForm = this.formBuilder.group({
        email : ['', [Validators.required, Validators.email]],
    })
  }
  get f() {
    return this.loginForm.controls;
  }
  isValidEmail : boolean = false;
  enterCredentails : boolean = false;
  errorCredentials : boolean = false;
  ErrorPopup : boolean = false;
  mustPassword : boolean = false;
  onSubmit() {
    this.enterCredentails = false;
    this.mustPassword = false;
    this.isValidEmail = false;
    this.lengthError = false;
    this.submitted = true;
    this.error = ''
    if(this.email.nativeElement.value){
      this.loginForm.patchValue({email : this.email.nativeElement.value})
    }
    if(!this.testOriginal && !this.f.email.value){
      this.enterCredentails = true;
      return
    }
    if(!this.validateEmail(this.f.email.value)){
      this.isValidEmail = true;
      return
    }
    if(!this.testOriginal){
      this.mustPassword = true;
      return
    }
    if(this.testOriginal.length < 8){
      this.lengthError = true;
      return
    }
    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
  this.isValidEmail = false;
    this.loading = true;
    this.lengthError = false;
    this.enterCredentails = false;
    this.mustPassword = false;
    this.authenticationService
      .login(this.f.email.value, this.testOriginal)
      .pipe(first())
      .subscribe(
        (data) => {
          console.log(data);
          console.log(data.status);

          // if(this.rememberMe){
            localStorage.setItem('email', this.f.email.value);
            localStorage.setItem('pass', this.testOriginal);
          // }else{
          //   this.authenticationService.storage = this.rememberMe;
          // }
          if (data.status == 'success') {
            if(data.data.admin === 1){
              console.log(data.data);
              data.authdata = window.btoa(localStorage.getItem('email') + ':' + localStorage.getItem('pass'));
              localStorage.setItem('adminAuth', JSON.stringify(data));
              localStorage.setItem('adminInfo', JSON.stringify(data.data));
              this.router.navigate(['administrator']);
            }else{
              // this.athenaService.setAuthenticationTokens(data.data.user.cfa_access_token, data.data.user.cfa_refresh_token);
              // this.authenticationService.userInfo.next({userName : data.data.user.name, userImg : data.data.user.image})
              // console.log(data.data.user);
              let groups : Array<any> = data.data.groups;
              groups = groups.sort((a, b) => {
                return ('' + a.text).localeCompare(b.text)
              });
              localStorage.setItem('groups', JSON.stringify(groups));
              localStorage.setItem('main_group',JSON.stringify(data.data?.main_group));
              localStorage.setItem('userInfo', JSON.stringify({name : data.data.user.name, logo : data.data.user.logo, img : data.data.user.image, status : data.data.user.status , id : data.data.user.id}));
              sessionStorage.setItem("userIDPendo", data.data.user.id);
              this.authenticationService.userInfo.next({name : data.data.user.name, logo : data.data.user.logo, img : data.data.user.image, status : data.data.user.status});
              this.router.navigate(['admin']);
            }
          }
        },
        (erroe) => {
          console.log(erroe)
          if (erroe === 'Wrong Credentials!'){
            console.log(erroe);
            this.error = erroe;
            this.errorCredentials = true;
            this.loading = false;
          }else {
            this.ErrorPopup = true;
            this.loading = false;
          }
        }
      );
      this.ErrorPopup = false;
  }
  hide: boolean = true;

  myFunction() {
    this.hide = !this.hide;
  }
HidePopup(){
  this.ErrorPopup = false;
}

  onRememberme(e){
   this.rememberMe = e;
   this.authenticationService.storage = e;
  }
  validateEmail(email)
    {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }
}
