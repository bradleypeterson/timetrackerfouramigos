import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class CommsService
{
  private userSource = new BehaviorSubject('');
  private loginSource = new BehaviorSubject('Login');

  currentUserName = this.userSource.asObservable();
  currentLogin = this.loginSource.asObservable();
  
  constructor() { }

  changeUserName(userName : string)
  {
    this.userSource.next(userName);
  }
  changeLogin(login : string)
  {
    this.loginSource.next(login);
  }
}
