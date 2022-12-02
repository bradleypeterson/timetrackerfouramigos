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
  public user: any;
  public isInstructor: boolean = false;
  public dataSource : any;
  public columnsToDisplay = ["groupID", "groupName", "isActive", "projectName"];

  constructor(
    private httpService:HttpService,
    private router: Router,) {}

  ngOnInit(): void
  {
    this.getUser();
    this.httpService.getCookie().subscribe((_user: any) => {
        this.user = _user;
        if(!this.user.username){
            console.log('redirecting')
            this.router.navigate(['./']);
        }
    });
  }

  getUser()
  {

    //Gets user from database
    this.httpService.getCookie().subscribe((_users: any) => {
      this.user = _users;
      //Allow user to create courses if they are an instructor
      if(_users.type == "Instructor")
      {
        this.isInstructor = true;
      }
      else
      {
        this.isInstructor = false;
      }
      this.getUserGroups(this.user.userID as number);
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
