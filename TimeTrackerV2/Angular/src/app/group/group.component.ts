import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Router} from '@angular/router';
import { User } from '../user.model';
import { HttpService} from "../services/http.service";
import {IUser} from "../interfaces/IUser";
import {group} from "@angular/animations";
import {IGroup} from "../interfaces/IGroup";
import {FormBuilder} from "@angular/forms";

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})

export class GroupComponent implements OnInit {
  public pageTitle = 'TimeTrackerV2 | Group'
  public errMsg = '';
  public user: any = JSON.parse(localStorage.getItem('currentUser') as string);
  private item;
  public groupName;
  public currUser: IUser;
  public group: any = history.state.data;
  public users: IUser[] = [];
  public startTime: any;
  public endTime: any;
  public description: any;
  public isClocked: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private httpService: HttpService,
    private formBuilder: FormBuilder
  )
  {
    this.isClocked = false;
    this.item = localStorage.getItem('currentGroup');
    console.log("The current group is: " + this.item);
    if (this.item) {
      this.item = JSON.parse(this.item);
      this.groupName = this.item[0];
    }

    this.currUser = new class implements IUser
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

  //Forms for creating a new time clock
  timeForm = this.formBuilder.group({
    startTime: '',
    endTime: ''
  });

  ngOnInit(): void
  {
    this.getUser()
    this.getGroupUsers();
  }

  //Get all users info based on local storage username
  getUser(): void
  {
    let payload = {
      username: this.user.username,
    }
    this.httpService.getUser(payload).subscribe((_user: any) =>
    {
      this.currUser = _user;
    });
  }

  //Gets all users in the group
  getGroupUsers(): void
  {
    this.httpService.getGroupUsers(this.group.groupID as number).subscribe((_users: any) =>
    {
      this.users = _users;
    })
  }

  //Leave the current group
  leaveGroup(): void
  {
    let payload = {
      userID: this.currUser.userID,
      groupID: this.group.groupID,
    }
    this.httpService.leaveGroup(payload).subscribe({
      next: data => {
        this.errMsg = "";
        this.router.navigate(['./groups']);
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

  //Adds a new clock time to the database
  submitTime(): void
  {
    let tempStart = new Date(this.startTime);
    let tempEnd = new Date(this.endTime);
  }

  clockIn(): void
  {
    var item = localStorage.getItem('currentUser');
    this.isClocked = true;
    if (typeof item === 'string')
    {
      this.user = JSON.parse(item) as User
    }

    if (this.user !== null)
    {
        let req = {
          timeIn: Date.now(), /// pull date from the HTML
          timeOut: null,
          createdOn: Date.now(),
          userID: this.user.userID,
          description: null /// pull description from the HTML
        };

        console.log(req);

      if (req !== null)
      {
        this.http.post<any>('http://localhost:8080/clock/', req, {headers: new HttpHeaders({"Access-Control-Allow-Headers": "Content-Type"})}).subscribe({
          next: data => {
            this.errMsg = "";
            console.log("user clocked in: " + this.user.username);
            /// populate a label to inform the user that they successfully clocked in, maybe with the time.
          },
          error: error => {
            this.errMsg = error['error']['message'];
          }
        });
      }
    }
  }

  clockOut(): void
  {
    var item = localStorage.getItem('currentUser');
    this.isClocked = false;
    if (typeof item === 'string')
    {
      this.user = JSON.parse(item) as User
    }

    if (this.user !== null )
    {
        let req = {
          timeIn: null,
          timeOut: Date.now(), /// pull date from the HTML
          createdOn: null,
          userID: this.user.userID,
          description: null /// pull description from the HTML
        };


      if (req !== null)
      {
        this.http.post<any>('http://localhost:8080/clock/', req, {headers: new HttpHeaders({"Access-Control-Allow-Headers": "Content-Type"})}).subscribe({
          next: data => {
            this.errMsg = "";
            console.log("user clocked out: " + this.user.username);
            /// populate a label to inform the user that they successfully clocked out, maybe with the time.
          },
          error: error => {
            this.errMsg = error['error']['message'];
          }
        });
      }
    }
  }
}
