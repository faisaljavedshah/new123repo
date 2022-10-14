import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-other-side-nav',
  templateUrl: './other-side-nav.component.html',
  styleUrls: ['./other-side-nav.component.scss'],
})
export class OtherSideNavComponent implements OnInit {
  constructor(private auth: AuthService) {}

  ngOnInit(): void {}
  logOut(): void {
    this.auth.logOut();
  }
}
