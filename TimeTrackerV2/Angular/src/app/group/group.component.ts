import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Router} from '@angular/router';
import { User } from '../user.model';
import { HttpService} from "../services/http.service";
import {IUser} from "../interfaces/IUser";
import {group} from "@angular/animations";
import {IGroup} from "../interfaces/IGroup";
import {FormBuilder} from "@angular/forms";
import {ITimeCard} from "../interfaces/ITimeCard";

export class IDateTimeCard
{
  timeslotID?: number;
  timeIn?: string;
  timeOut?: string;
  isEdited?: boolean;
  createdOn?: string;
  userID?: number;
  description?: string;
  groupID?: number;
  hours?: string;
}

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
  public times: ITimeCard[] = [];
  public dateTime: IDateTimeCard[] = [];
  public startTime: any;
  public endTime: any;
  public description: any;
  public isClocked: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private httpService: HttpService,
    private formBuilder: FormBuilder,
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

  ngOnInit(): void
  {
    this.getUser();
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
      //Get all time cards for the users group
      this.getTimeCards();
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

  //Gets all timeCards for the user for the specified group
  getTimeCards(): void
  {
    let payload = {
      groupID: this.group.groupID,
      userID: this.user.userID
    }
    console.log("payload.groupID:" + payload.groupID + " payload.userID: " + payload.userID);
    this.httpService.getTimeCards(payload).subscribe((_timecard: any) =>
    {
      this.times = _timecard;
      this.dateTime = [];
      this.times.forEach(time =>
      {
        let tempDate = new IDateTimeCard();
        //Parse mill to date
        let newIn = new Date(parseInt(time.timeIn as string));
        let newOut = new Date(parseInt(time.timeOut as string));
        let newCreate = new Date(parseInt(time.createdOn as string));
        //Convert milliseconds to hours
        let hours = new Date(parseInt(time.timeOut as string) - parseInt(time.timeIn as string)).toISOString().slice(11,19);


        //Assign new values to tempDate
        tempDate.groupID = time.groupID;
        tempDate.timeIn = newIn.toLocaleString();
        tempDate.timeOut = newOut.toLocaleString();
        tempDate.userID = time.userID;
        tempDate.createdOn = newCreate.toLocaleString();
        tempDate.description = time.description;
        tempDate.isEdited = time.isEdited;
        tempDate.timeslotID = time.timeslotID;
        tempDate.hours = hours;
        //Add to array
        this.dateTime.push(tempDate);
      });
    });
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
    let payload = {
      timeIn: tempStart.getTime(),
      timeOut: tempEnd.getTime(),
      createdOn: Date.now(),
      userID: this.currUser.userID,
      description: this.description,
      groupID: this.group.groupID
    }
    this.httpService.createTimeCard(payload).subscribe({
      next: data => {
        this.errMsg = "";
        this.getTimeCards();
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

  clockIn(): void
  {
    var item = localStorage.getItem('currentUser');
    this.isClocked = true;

    if (this.currUser !== null)
    {
      console.log("groupID: " + this.group.groupID);
        let req = {
          timeIn: Date.now(), /// pull date from the HTML
          timeOut: null,
          createdOn: Date.now(),
          userID: this.currUser.userID,
          description: null, /// pull description from the HTML
          groupID: this.group.groupID
        };

        console.log(req);

      if (req !== null)
      {
        this.http.post<any>('http://localhost:8080/clock/', req, {headers: new HttpHeaders({"Access-Control-Allow-Headers": "Content-Type"})}).subscribe({
          next: data => {
            this.errMsg = "";
            console.log("user clocked in: " + this.currUser.username);
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

    if (this.currUser !== null )
    {
        let req = {
          timeIn: null,
          timeOut: Date.now(), /// pull date from the HTML
          createdOn: null,
          userID: this.currUser.userID,
          description: null /// pull description from the HTML
        };


      if (req !== null)
      {
        this.http.post<any>('http://localhost:8080/clock/', req, {headers: new HttpHeaders({"Access-Control-Allow-Headers": "Content-Type"})}).subscribe({
          next: data => {
            this.errMsg = "";
            /// populate a label to inform the user that they successfully clocked out, maybe with the time.
            this.getTimeCards();
          },
          error: error => {
            this.errMsg = error['error']['message'];
          }
        });
      }
    }
  }
}
