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
  public isAdmin: boolean = false;

  constructor(
    private data: CommsService,
    private router: Router,
    private httpService: HttpService
  ) {
    //Subscribes to the CommsService for username/login/instructor updates
    this.data.currentUserName.subscribe((userName) => (this.userName = userName));
    this.data.currentLogin.subscribe((login) => (this.login = login));
    this.data.currentInstructor.subscribe((isInstructor) => (this.isInstructor = isInstructor));
    this.data.currentAdmin.subscribe((isAdmin) => (this.isAdmin = isAdmin));
  }

  ngOnInit(): void {
    this.getUser();
  }

  getUser(): void {
    this.httpService.getCookie().subscribe((_users: any) => {
      this.user = _users;
      this.userName = _users.username;
      this.login = 'Logout';

      this.isInstructor = _users.type == 'Instructor';
      this.isAdmin = _users.type == 'Admin';
    });
}
destroyCookie(): void {
     this.httpService.logOut().subscribe((_user: any) => {
          console.log('logged-out')
        });
}

  onLogin(): void {
    //Logout if someone is already logged in
    if (this.login == 'Logout') {
        this.destroyCookie()

      this.data.changeLogin('Login');
      this.data.changeUserName('');
      this.data.changeInstructor(false);
      this.data.changeAdmin(false);
      this.router.navigate(['']);
    } else {
      this.router.navigate(['']);
    }
  }
}

