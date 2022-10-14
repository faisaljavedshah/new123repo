import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-dashboard-header',
  templateUrl: './dashboard-header.component.html',
  styleUrls: ['./dashboard-header.component.scss'],
})
export class DashboardHeaderComponent implements OnInit {
  @Output() toggleSidebarForMe: EventEmitter<any> = new EventEmitter();
  constructor() {}

  ngOnInit(): void {}
  searchClicked() {
    alert('Search Clicked');
  }

  toggleSidebar() {
    this.toggleSidebarForMe.emit();
  }
}
