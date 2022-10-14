import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private_loading = new BehaviorSubject<boolean>(false);
  public readonly loading$ = this.private_loading.asObservable();

  constructor() { }
  show(){
    this.private_loading.next(true);
  }
  hide() {
 
    this.private_loading.next(false);
  }
}
