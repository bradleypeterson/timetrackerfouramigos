import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class CommsService
{
  private userSource = new BehaviorSubject('');
  private loginSource = new BehaviorSubject('Login');
  private instructorSource = new BehaviorSubject(false);
  private adminSource = new BehaviorSubject(false);

  currentUserName = this.userSource.asObservable();
  currentLogin = this.loginSource.asObservable();
  currentInstructor = this.instructorSource.asObservable();
  currentAdmin = this.adminSource.asObservable();

  constructor() { }

  changeUserName(userName : string)
  {
    this.userSource.next(userName);
  }
  changeLogin(login : string)
  {
    this.loginSource.next(login);
  }
  changeInstructor(instructor : boolean)
  {
    this.instructorSource.next(instructor);
  }
  changeAdmin(admin : boolean)
  {
    this.adminSource.next(admin)
  }
}
