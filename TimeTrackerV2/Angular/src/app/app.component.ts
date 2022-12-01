import { Component, OnInit } from '@angular/core';
import { CommsService } from './comms.service';
import { User } from './user.model';
import {Router} from '@angular/router';
import {HttpService} from "./services/http.service";
import {HttpClient} from "@angular/common/http";
import {IUser} from "./interfaces/IUser";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit
{
  public title = 'TimeTrackerV2';
  public userName: string = "";
  public login: string = "Login";
  public user: IUser;
  public isInstructor: boolean = false;


  constructor(private data: CommsService, private router: Router, private httpService: HttpService)
  {
    //Subscribes to the CommsService for username/login/instructor updates
    this.data.currentUserName.subscribe(userName => this.userName = userName);
    this.data.currentLogin.subscribe(login => this.login = login);
    this.data.currentInstructor.subscribe(isInstructor => this.isInstructor = isInstructor);
    this.user = new class implements IUser
    {
      firstName?: string;
      id?: number;
      isActive?: boolean;
      lastName?: string;
      password?: string;
      salt?: string;
      type?: string;
      username?: string;
    }
  }

  ngOnInit(): void
  {

  }

  // getUser(): void
  // {
  //   this.httpService.getCookie().subscribe((_users: any) => {
  //     this.user = _users;
  //     //Allow user to create courses if they are an instructor
  //     if(_users.type == "Instructor")
  //     {
  //       this.isInstructor = true;
  //     }
  //     else
  //     {
  //       this.isInstructor = false;
  //     }
  //   });
  // }

  onLogin(): void
  {
    //Logout if someone is already logged in
    if(this.login == "Logout")
    {
      this.data.changeLogin("Login");
      this.data.changeUserName("");
      this.data.changeInstructor(false);
      localStorage.setItem("currentUser", JSON.stringify(new User));
      this.router.navigate(['']);
    }
  }
}

