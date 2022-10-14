import { Component, ElementRef, OnInit } from '@angular/core';
import { Directive, HostListener } from "@angular/core";
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
// import { AuthService } from 'src/app/services/auth.service';
import { first } from 'rxjs/operators';
import { signupService } from '../../_services/index';
@Component({
  selector: 'app-sgnup',
  templateUrl: './sgnup.component.html',
  styleUrls: ['./sgnup.component.scss'],
})
export class SgnupComponent implements OnInit {
  password: string = '';
  showpass: string = '';
  public showPassword: boolean;
  disabled = 'isDisabled';
  SignupForm: FormGroup;
  bordered : boolean = false;
  public showPassword1: boolean = false;
  loading = false;
  submitted = false;
  returnUrl: string;
  error = '';
  isValiddEmail : boolean = false;
  passwordLength : boolean = false;
  alreadyTaken : boolean = false;
  wentWrong: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private signupService: signupService,
    private elm: ElementRef
  ) {
    if (this.signupService.userValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    // if (this.auth.isLoggedIn()) {
    //   this.router.navigate(['admin']);
    // }
    this.SignupForm = this.formBuilder.group({
      email: [''],
      password: [''],
    });
    // this.returnUrl = this.route.snapshot.queryParams['/admin/profile'] || '/';
  }

  get f() {
    return this.SignupForm.controls;
  }
  isPasswordValid : boolean = false;
  isSameePasswords: boolean = true;
  onSubmit() {
    this.submitted = true;
    this.passwordLength = false;
    this.isValiddEmail = false;
    this.alreadyTaken = false;
    this.wentWrong = false;
    this.isPasswordValid = false;
    this.isSameePasswords = true
    if (this.SignupForm.invalid) {
      return;
    }
    if(!this.validateEmail(this.f.email.value)){
        this.isValiddEmail = true;
        this.bordered = true;
        return
    }
    if (
      this.testOriginal !== this.testOriginal1
      // ||
      // (this.testOriginal.length < 8 && this.testOriginal.length > 0)
    ) {
      this.isSameePasswords = false;
      this.bordered = true;
      return;
    }
    // if(this.isPasswordValid === true || this.isSameePasswords === false )
    // {
    //   this.bordered = true;
    //   console.log('new error');

    // }
    if(!this.validatePassword(this.testOriginal)){
      this.isPasswordValid = true;
      this.bordered = true;
      return
    }
    if(!this.validatePassword(this.testOriginal1)){
      this.isPasswordValid = true;
      this.bordered = true;
      return
    }

    this.isPasswordValid = false;
    this.isSameePasswords = true;
    this.loading = true;
    this.passwordLength = false;
    this.isValiddEmail = false;
    this.alreadyTaken = false;
    this.wentWrong = false;
    this.signupService.signup(this.f.email.value, this.testOriginal).subscribe(
      (data) => {
        this.signupService.email.next(this.f.email.value);
        console.log('data--', data);

        if (data.status == 'success') {
          localStorage.setItem('token', data.data.access_token);
          this.router.navigate(['/otpsignup']);
        } else {
          if(data.message === 'Email already registered! Login to Continue or use other Email'){
            this.alreadyTaken = true;
          }else{
            console.log(data);

            this.wentWrong = true;
          }
        }
        this.loading = false;
      },
      (error) => {
          if(error === 'Email already registered! Login to Continue or use other Email'){
            this.alreadyTaken = true;
          }else{
            this.wentWrong = true;
          }
          this.loading = false;
      }
    );
  }
  validateEmail(email)
    {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }
    validatePassword(password){
      var re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&=,./;:'"#^`~><|{}+)(_-])[A-Za-z\d@$!%*?&=,./;:`~'"#^><|{}+)(_-]{8,15}$/;
      return re.test(password);
    }
  hide: boolean = true;

  myFunction() {
    this.hide = !this.hide;
  }
  newpass: any;
  newpass2: any;
  ngAfterViewInit(): void {
    this.newpass = this.elm.nativeElement.querySelector('#astpassshow');
  }
  testOriginal: any = '';
  testOriginal1: any = '';

}
