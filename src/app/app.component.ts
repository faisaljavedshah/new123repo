import { Component, OnInit, Renderer2, Inject, AfterViewInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Title } from '@angular/platform-browser';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'admin-panel-layout';
  sideBarOpen = true;
  constructor(  private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private titleService: Title){}

  favIcon: HTMLLinkElement
  checkDomain : string = ''
  ngOnInit(){
    this.renderer.addClass(this.document.body, 'convirza-cai');
    this.checkDomain = window.location.hostname;
  }
  ngAfterViewInit(){
    this.favIcon = document.querySelector('#appIcon');
    if(this.checkDomain == 'callrater.com'){
      this.favIcon.href = 'assets/angular/callRater.ico';
      this.titleService.setTitle('Call Rater')
    }else{
      this.favIcon.href = 'assets/angular/favicon.ico';
      this.titleService.setTitle('Convirza AI')
    }
  }

  sideBarToggler() {
    this.sideBarOpen = !this.sideBarOpen;
  }
}
