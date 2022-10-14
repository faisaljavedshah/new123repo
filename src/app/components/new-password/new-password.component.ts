import { Component, ElementRef, HostListener, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ForgotPasswordService } from 'src/app/_services/forgot-password.service';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.scss'],
})
export class NewPasswordComponent implements OnInit {
  showpass: string = '';
  public showPassword: boolean;
  public showPasswordd: boolean;
  public showPassword1: boolean = false;
  isorderred: boolean = false;
  loading: boolean = false;
  isValidLength: boolean = false;
  passChanged: boolean = false;
  constructor(
    private elm: ElementRef,
    private resetServive: ForgotPasswordService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(data=>{
      this.resetServive.parameters.next(data);
      this.resetServive.parameters.subscribe(d=>{
        if(d.token){
          this.resetServive.token = d.token;
          this.resetServive.getUserData(d.token).subscribe(res=>{
            console.log(res);
            if(res.result=== 'success'){
                this.resetServive.userInfo.next(res.json)
            }else{
              alert(res.err)
            }

          }, err=>{
            console.log(err);

          })
        }
        console.log(d);
      })
    })
  }

  hide = true;

  myFunction() {
    this.hide = !this.hide;
  }
  changePassword(val) {
    this.showpass = val;
  }
  newpass: any;
  newpass2: any;
  ngAfterViewInit(): void {
    this.newpass = this.elm.nativeElement.querySelector('#astpassshow');
    this.newpass2 = this.elm.nativeElement.querySelector('#astpassshow2');
  }

  testOriginal: any = '';
  testAst: any = '';
  testHidePass = true;
  astOne: any = '';
  notSamePasswords: boolean = false;


  testOriginal1: any = '';
  testAst1: any = '';
  testHidePass1 = true;
  astOne1: any = '';

  isPassworrdValid : boolean = false;
  onResetPassword() {
    this.isValidLength = false;
    this.isPassworrdValid = false;
    this.notSamePasswords = false;
    if (this.testOriginal !== this.testOriginal1) {
      this.notSamePasswords = true;
      this.isorderred = true;
      return
    }
    if(this.testOriginal.length < 8){
      this.isPassworrdValid = true;
      this.isorderred = true;
      return;
    }
    this.isPassworrdValid = false;
    this.loading = true;
    this.notSamePasswords = false;
    this.isValidLength = false;
    this.resetServive.resetPassword(this.testOriginal).subscribe(
      (res) => {
        this.loading = false;
        console.log('res ====', res);

        if (res.status === 'success') {
          this.passChanged = true;
          // setTimeout(() => {
          //   this.passChanged = false;
          //   this.router.navigate(['/login']);
          // }, 3000);
        }
      },
      (err) => {
        this.loading = false;
        alert(err);
      }
    );
  }
  validatePassword(password){
    var re = /^(?=.*\d).{8,}$/;
    return re.test(password);
  }
  // app-signup-complete
  // @HostListener("paste", ["$event"]) blockPaste(e: KeyboardEvent) {
  //   e.preventDefault();
  // }

  // @HostListener("copy", ["$event"]) blockCopy(e: KeyboardEvent) {
  //   e.preventDefault();
  // }

  // @HostListener("cut", ["$event"]) blockCut(e: KeyboardEvent) {
  //   e.preventDefault();
  // }
}
