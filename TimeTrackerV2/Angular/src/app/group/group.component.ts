import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Router} from '@angular/router';
import { User } from '../user.model';
import { HttpService} from "../services/http.service";
import {IUser} from "../interfaces/IUser";
import {animate, group, state, style, transition, trigger} from "@angular/animations";
import {IGroup} from "../interfaces/IGroup";
import {FormBuilder} from "@angular/forms";
import {ITimeCard} from "../interfaces/ITimeCard";
import {MatTableDataSource} from "@angular/material/table";
import { MatDialog} from "@angular/material/dialog";
import {EditTimeDialogComponent} from "../Modals/edit-time-dialog/edit-time-dialog.component";

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
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
  public descriptionAuto: any;
  public isClocked: any;
  public isNegative: any;

  public pieData: PieChartData[] = [];
  public title = "Hours Per Member"

  public membersDisplay = ["username", "firstName", "lastName"];
  public timeDisplay = ["timeIn", "timeOut", "hours", "description"];
  public members: IUser[] = [];
  public expandedElementMember?: GroupTimeDataSource | null;
  public dataSourceMembers: MatTableDataSource<any> = new MatTableDataSource<any>();
  public timeCardData: GroupTimeDataSource[] = [];
  public tempUser: IUser;

  constructor(
    private http: HttpClient,
    private router: Router,
    private httpService: HttpService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog
  )
  {
    this.tempUser = new class implements IUser {
      firstName?: string;
      isActive?: boolean;
      lastName?: string;
      password?: string;
      salt?: string;
      type?: string;
      userID?: number;
      username?: string;
    }
    this.isClocked = false;
    this.isNegative = true;
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
      this.getGroupUsers();
    });
  }

  //Gets all users in the group
  getGroupUsers(): void
  {
    this.httpService.getGroupUsers(this.group.groupID as number).subscribe((_users: any) =>
    {
      this.users = _users;
      this.members = _users;
      this.timeCardData = [];
      this.reloadTimeCard();
    });
  }

  //Loops through users to reload the time card info
  reloadTimeCard(): void
  {
    this.users.forEach(user => {
      //Get all time cards for the users group
      this.getTimeCards(user);
    });
  }

  //Gets all timeCards for the user for the specified group
  getTimeCards(user: any): void
  {
    let payload = {
      groupID: this.group.groupID,
      userID: user.userID
    }
    this.pieData = [];
    this.timeCardData = [];
    this.httpService.getTimeCards(payload).subscribe((_timecard: any) =>
    {
      //Only load the current users time cards
      if(user.userID == this.user.userID)
      {
        this.times = _timecard;
        this.dateTime = [];
        this.times.forEach(time =>
        {
          //Add to array
          this.dateTime.push(this.parseTimeCard(time));
        });
      }
      this.loadTime(_timecard, user);
      this.getTotalTimes(_timecard, user);

    });
  }
  //loads timeCards into array for table
  loadTime(timeCards: ITimeCard[], user: IUser)
  {
    let hourTimes: IDateTimeCard[] = [];
    if(timeCards && Array.isArray(timeCards) && timeCards.length)
    {
      timeCards.forEach(time =>
      {
         //Add to array
         hourTimes.push(this.parseTimeCard(time));
      });
      this.timeCardData = [...this.timeCardData, {username: user.username, firstName: user.firstName, lastName: user.lastName, times: new MatTableDataSource(hourTimes)}]
    }
    else
    {
      this.timeCardData = [...this.timeCardData, {username: user.username, firstName: user.firstName, lastName: user.lastName}];
    }
    this.dataSourceMembers = new MatTableDataSource(this.timeCardData);
  }

  //Parses the retrieved timecard into a IDateTimeCard
  parseTimeCard(time: ITimeCard): IDateTimeCard
  {
    let tempDate = new IDateTimeCard();
    //Parse mill to date
    let newIn = new Date(parseInt(time.timeIn as string));
    let newOut = new Date(parseInt(time.timeOut as string));
    let newCreate = new Date(parseInt(time.createdOn as string));


    //Assign new values to tempDate
    tempDate.groupID = time.groupID;
    tempDate.timeIn = newIn.toLocaleString();
    tempDate.timeOut = newOut.toLocaleString();
    tempDate.userID = time.userID;
    tempDate.createdOn = newCreate.toLocaleString();
    tempDate.description = time.description;
    tempDate.isEdited = time.isEdited;
    tempDate.timeslotID = time.timeslotID;
    tempDate.hours = this.getTime(parseInt(time.timeOut as string) - parseInt(time.timeIn as string));

    return tempDate
  }

  //Gets the total time for each user and sets the pie chart
  getTotalTimes(timeCards: ITimeCard[], user: IUser): void
  {
    let totalTime = 0;
    let name = user.firstName + " " + user.lastName;
    timeCards.forEach(timeCard =>
    {
      let newIn = new Date(parseInt(timeCard.timeIn as string));
      let newOut = new Date(parseInt(timeCard.timeOut as string));
      let hours = (newOut.getTime() - newIn.getTime())/ 3600000;
      totalTime += hours;
    });
    this.pieData = [...this.pieData, {name: name, value: totalTime}];
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

  //Deletes selected time stamp from database
  deleteTime(date: any): void
  {
    let payload = {
        timeslotID: date.timeslotID,
      }
    this.httpService.deleteTimeCard(payload).subscribe({
      next: data => {
        this.errMsg = "";
        this.reloadTimeCard()
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

  //Pops up a modal for the user to edit
  editTime(date: any): void
  {
    let dialog = this.dialog.open(EditTimeDialogComponent, {data: {timeIn: new Date(date.timeIn).toISOString().slice(0, -1), timeOut: new Date(date.timeOut).toISOString().slice(0, -1), description: date.description}});

    dialog.afterClosed().subscribe(result => {
      //Check if the dialog was closed or saved
      if(result != "false" && result != undefined)
      {
        let payload = {
          timeIn: new Date(result.timeIn).getTime(),
          timeOut: new Date(result.timeOut).getTime(),
          description: result.description,
          timeslotID: date.timeslotID
        }
        this.httpService.updateTimeCard(payload).subscribe((_return: any) =>{
          this.reloadTimeCard();
        });

      }


    });
  }

  //Adds a new clock time to the database
  submitTime(): void
  {
    //Format dates
    let tempStart = new Date(this.startTime);
    let tempEnd = new Date(this.endTime);
    let time = tempEnd.getTime() - tempStart.getTime();

    //check for accepted times
    if(time < 0 || isNaN(tempStart.getTime()) || isNaN(tempEnd.getTime()))
    {
      this.isNegative = false;
      //Clear fields
      this.startTime = "";
      this.endTime = "";
      this.description = "";
    }
    else
    {
      this.isNegative = true;
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
          this.reloadTimeCard();
          //Clear fields
          this.startTime = "";
          this.endTime = "";
          this.description = "";
        },
        error: error => {
          this.errMsg = error['error']['message'];
        }
      });
    }
  }

  //Get time to display based on milliseconds
  getTime(time: any): string
  {
    const portions: string[] = [];

    const msInHour = 1000 * 60 * 60;
    const hours = Math.trunc(time / msInHour);
    if (hours > 0)
    {
      portions.push(hours + 'h');
      time = time - (hours * msInHour);
    }

    const msInMinute = 1000 * 60;
    const minutes = Math.trunc(time / msInMinute);
    if (minutes > 0)
    {
      portions.push(minutes + 'm');
      time = time - (minutes * msInMinute);
    }

    const seconds = Math.trunc(time / 1000);
    if (seconds > 0)
    {
      portions.push(seconds + 's');
    }

    return portions.join(' ');
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
          description: null,
          groupID: this.group.groupID
        };

      if (req !== null)
      {
        this.http.post<any>('http://localhost:8080/clock/', req, {headers: new HttpHeaders({"Access-Control-Allow-Headers": "Content-Type"})}).subscribe({
          next: data => {
            this.errMsg = "";
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
          description: this.descriptionAuto
        };


      if (req !== null)
      {
        this.http.post<any>('http://localhost:8080/clock/', req, {headers: new HttpHeaders({"Access-Control-Allow-Headers": "Content-Type"})}).subscribe({
          next: data => {
            this.errMsg = "";
            /// populate a label to inform the user that they successfully clocked out, maybe with the time.
            this.reloadTimeCard();
            this.descriptionAuto = "";
          },
          error: error => {
            this.errMsg = error['error']['message'];
          }
        });
      }
    }
  }
}

export interface PieChartData
{
  name?: string;
  value?: number;
}
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
export interface GroupTimeDataSource
{
  username?: string;
  firstName?: string;
  lastName?: string;
  times?: IDateTimeCard | MatTableDataSource<IDateTimeCard>
}
