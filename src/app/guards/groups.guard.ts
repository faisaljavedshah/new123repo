import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GroupsGuard implements CanActivate {
  userRole : number
  constructor(){
    this.userRole = JSON.parse(localStorage.getItem('user')).data.user.role
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if (this.userRole === 2 || this.userRole === 3 || this.userRole === 8) {
        return false;
      }
      return true
  }

}
