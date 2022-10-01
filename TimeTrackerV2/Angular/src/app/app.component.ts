import { Component, OnInit } from '@angular/core';
import { CommsService } from './comms.service';
import { User } from './user.model';
import {Router} from '@angular/router';

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

  constructor(private data: CommsService, private router: Router) 
  {
    //Subscribes to the CommsService for username/login updates
    this.data.currentUserName.subscribe(userName => this.userName = userName);
    this.data.currentLogin.subscribe(login => this.login = login);
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
      localStorage.setItem("currentUser", JSON.stringify(new User));
      this.router.navigate(['']);
    }
  }
}

