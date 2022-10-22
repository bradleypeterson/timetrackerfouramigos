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
  title = 'TimeTrackerV2';
  userName: string = "";
  login: string = "Login";
  isInstructor: boolean = false;


  constructor(private data: CommsService, private router: Router, private httpService: HttpService)
  {
    //Subscribes to the CommsService for username/login/instructor updates
    this.data.currentUserName.subscribe(userName => this.userName = userName);
    this.data.currentLogin.subscribe(login => this.login = login);
    this.data.currentInstructor.subscribe(isInstructor => this.isInstructor = isInstructor);
  }

  ngOnInit(): void
  {

  }

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

