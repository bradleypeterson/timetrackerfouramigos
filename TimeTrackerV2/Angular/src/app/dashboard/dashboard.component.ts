import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { HttpService } from '../services/http.service';
import { ICourse } from '../interfaces/ICourse';
import { IGroup } from '../interfaces/IGroup';
import {IUser} from "../interfaces/IUser";
import { NULL_EXPR } from '@angular/compiler/src/output/output_ast';
import { ICourseRequest } from '../interfaces/ICourseRequest';
import { IProject } from '../interfaces/IProject';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements  OnInit
{
  public user: any = JSON.parse(localStorage.getItem('currentUser') as string);
  public courses: ICourse[] = [];
  public courseRequests: ICourseRequest[] = [];
  public userTypeHolder: IUser;
  public groups: IGroup[] = [];
  public projects: IProject[] = [];
  public gSize = 0;
  public cSize = 0;
  public pSize = 0;

  //Allow course creation if the user is an Instructor
  public isInstructor: boolean = false;

  constructor(
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private router: Router,
    private httpService: HttpService,)
  {
    this.userTypeHolder = new class implements IUser
    {
      firstName?: string;
      userID?: number;
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
    this.getUserCourses();
    
    
    // get user groups
    //this.getUserGroups(this.userTypeHolder.userID as number);
  }


  // get the user's courses:
  // get courses where course request user ID and = current user ID
  // and where status = 1, and active = 0
  // and where course request course ID = Course course ID

  getUserCourses(): void {

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
      this.getUserGroups(this.userTypeHolder.userID as number);

      this.getUserProjects(this.userTypeHolder.userID as number);
    });

    
    this.httpService.getUserCourses(this.user.userID).subscribe((_courses: any) => { this.courses = _courses; this.cSize = this.courses.length; console.log(this.courses); });



  }


  // get the user's groups
  getUserGroups(id: number)
  {
    this.httpService.getUserGroups(id).subscribe((_groups: any) => { this.groups = _groups; this.gSize = this.groups.length;});

  }


  // get the user's groups
  getUserProjects(id: number)
  {
    this.httpService.getUserProjects(id).subscribe((_projects: any) => { this.projects = _projects; this.pSize = this.projects.length; });

  }


  //Sets the current course in localstorage and navigates the user to the course page
  setCourseAndMove(course: ICourse) {
    this.router.navigate(['./course'], {state:{data: course}});
  }

  setGroupAndMove(group: IGroup) {
    this.router.navigate(['./group'], {state:{data: group}});
  }


  setProjectAndMove(project: IProject) {
    this.router.navigate(['./projcet'], {state:{data: project}});
  }




  
  public pageTitle = 'TimeTrackerV2 | Dashboard'

}
