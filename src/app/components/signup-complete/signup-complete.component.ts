import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup-complete',
  templateUrl: './signup-complete.component.html',
  styleUrls: ['./signup-complete.component.scss']
})
export class SignupCompleteComponent implements OnInit {

  constructor(
    private router: Router,) { }

  ngOnInit(): void {
  }
redirect(){
  this.router.navigate(['login']);
}
}
