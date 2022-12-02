import { Component, OnInit } from '@angular/core';
import { CommsService } from './comms.service';
import { User } from './user.model';
import { Router } from '@angular/router';
import { HttpService } from './services/http.service';
import { HttpClient } from '@angular/common/http';
import { IUser } from './interfaces/IUser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  public title = 'TimeTrackerV2';
  public userName: string = '';
  public login: string = 'Login';
  public user: any;
  public isInstructor: boolean = false;

  constructor(
    private data: CommsService,
    private router: Router,
    private httpService: HttpService
  ) {
    //Subscribes to the CommsService for username/login/instructor updates
    this.data.currentUserName.subscribe(
      (userName) => (this.userName = userName)
    );
    this.data.currentLogin.subscribe((login) => (this.login = login));
    this.data.currentInstructor.subscribe(
      (isInstructor) => (this.isInstructor = isInstructor)
    );
  }

  ngOnInit(): void {
    this.getUser();
  }

  getUser(): void {
    this.httpService.getCookie().subscribe((_users: any) => {
      this.user = _users;
      this.userName = _users.username;
      this.login = 'Logout';
      //Allow user to create courses if they are an instructor
      if (_users.type == 'Instructor') {
        this.isInstructor = true;
      } else {
        this.isInstructor = false;
      }
    });
  }

  onLogin(): void {
    //Logout if someone is already logged in
    if (this.login == 'Logout') {
        this.httpService.logOut().subscribe((_user: any) => {
          console.log('logged-out')
        });
      this.data.changeLogin('Login');
      this.data.changeUserName('');
      this.data.changeInstructor(false);
      this.router.navigate(['']);
    } else {
      this.router.navigate(['']);
    }
  }
}
