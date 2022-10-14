import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// import { AthenaService } from '@convirza/athena';
import { AdministratorService } from 'src/app/_services/administrator.service';
import { AuthenticationService } from 'src/app/_services/authentication.service';

@Component({
  selector: 'app-administrater',
  templateUrl: './administrater.component.html',
  styleUrls: ['./administrater.component.scss']
})
export class AdministraterComponent implements OnInit {
  grouprole = false;
  currentRole = 'Admin';
  adminaccount = false;
  userAccount = false;
  currentuser = '';
  currentAccount = '';
  constructor(private admin : AdministratorService,
    private router: Router,
    private authenticationService: AuthenticationService,
    // private athenaService: AthenaService,
    private login : AuthenticationService) { }
  allGroups = [];
  ngOnInit(): void {
    this.login.userSubject.next(JSON.parse(localStorage.getItem('adminAuth')))
    let data = JSON.parse(localStorage.getItem('adminInfo'));
    this.allAccounts = data.billingList;
    this.duplicateAccounts = data.billingList;
  }
  duplicateAccounts : Array<any> = []
  duplicateUser : Array<any> = []
  allAccounts : Array<any> = [{org_unit_name : 'group 1'}, { org_unit_name : 'group 2'}, { org_unit_name : 'group 3'}, { org_unit_name : 'group 4'}];
  allUsers : Array<any> = []
  onChangeRole(e) {
    this.grouprole = false;
    this.currentRole = e;
  }
  onChangeGroups(e, id) {
    this.userListLoading = true;
    this.adminaccount = false;
    this.currentAccount = e;
    this.currentuser = '';
    this.currentUserID = undefined;
    this.groupQuery = e;
    if(localStorage.getItem(id)){
      this.allUsers = JSON.parse(localStorage.getItem(id));
      this.duplicateUser = JSON.parse(localStorage.getItem(id));
      this.userListLoading = false;
    }else{
      this.admin.onSelectGroups(id).subscribe(res=>{
        console.log(res);
        this.allUsers = res.data;
        this.duplicateUser = res.data;
        localStorage.setItem(id , JSON.stringify(this.allUsers));
        this.userListLoading = false;
      })
    }
  }
  currentUserID : number
  onChangeUser(e, id) {
    this.userAccount = false;
    this.currentuser = e;
    this.currentUserID = id;
  }
  userListLoading : boolean = false;
  openUserList(){
    if(this.userListLoading){
      return
    }else{
      this.userAccount = !this.userAccount;
    }
  }
  isLogingIn : boolean  = false;
  onImpersonate(){
    this.isLogingIn = true
    this.admin.signIn(this.currentUserID).subscribe(data=>{
      console.log(data);
      if(data.status === 'success'){
        data.authdata = window.btoa(localStorage.getItem('email') + ':' + localStorage.getItem('pass'));
        localStorage.setItem('user', JSON.stringify(data));
        let groups : Array<any> = data.data.groups;
              groups = groups.sort((a, b) => {
                return ('' + a.text).localeCompare(b.text)
              });
        localStorage.setItem('groups', JSON.stringify(groups));
        localStorage.setItem('main_group',JSON.stringify(data.data?.main_group));
        // this.athenaService.setAuthenticationTokens(data.data.user.cfa_access_token, data.data.user.cfa_refresh_token);
        localStorage.setItem('token', data.data.access_token);
        localStorage.setItem('userInfo', JSON.stringify({name : data.data.user.name, logo : data.data.user.logo, img : data.data.user.image, status : data.data.user.status}));
        this.authenticationService.userInfo.next({name : data.data.user.name, logo : data.data.user.logo, img : data.data.user.image, status : data.data.user.status});
        this.router.navigate(['admin']);
        this.isLogingIn = false;
      }

    })
  }
  groupQuery : string = ''
  userQuery : string = ''
  searchGroup(e:string){
    this.allAccounts = this.duplicateAccounts.filter(item =>{
      if(item.org_unit_name.toLowerCase().includes(e.toLowerCase())){
          return item;
      }
    })
  }
  searchUser(e:string){
    this.allUsers = this.duplicateUser.filter(item =>{
      let name = item.first_name + ' ' + item.last_name
      if(name.toLowerCase().includes(e.toLowerCase())){
          return item;
      }
    })
  }
}
