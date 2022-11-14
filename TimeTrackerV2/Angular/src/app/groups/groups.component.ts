import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../services/http.service';
import {IGroup} from "../interfaces/IGroup";
import {IProject} from "../interfaces/IProject";
import {IUser} from "../interfaces/IUser";
import {ICourse} from "../interfaces/ICourse";
import {MatTableDataSource} from "@angular/material/table";

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent implements OnInit {

  groups: IGroup[] = [];
  private project: IProject = history.state.data;
  public user: any = JSON.parse(localStorage.getItem('currentUser') as string);
  public userTypeHolder: IUser;
  public isInstructor: boolean = false;
  public dataSource : any;
  public columnsToDisplay = ["groupID", "groupName", "isActive", "projectName"];

  constructor(
    private httpService:HttpService,
    private router: Router,
    )
  {
    this.userTypeHolder = new class implements IUser
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

  getUser()
  {
    let payload = {
      username: this.user.username,
    }
    //Gets user from database
    this.httpService.getUser(payload).subscribe((_user: any) =>
    {
      this.userTypeHolder = _user;
      //Allow user to create courses if they are an instructor
      if(this.userTypeHolder.type == "Instructor")
      {
        this.isInstructor = true;
      }
      else
      {
        this.isInstructor = false;
      }
      //Get the groups the user is in
      console.log("userID: " + this.userTypeHolder.userID);
      this.getUserGroups(this.userTypeHolder.userID as number);
    });
  }

  getUserGroups(id: number)
  {
    this.httpService.getUserGroups(id).subscribe((_groups: any) =>
    {
      this.groups = _groups;
      this.dataSource = new MatTableDataSource(this.groups);
    });
  }

  //Sets the current group in localstorage and navigates the user to the group page
  setGroupAndMove(group: IGroup)
  {
    this.router.navigate(['./group'], {state:{data: group}});
  }
}
