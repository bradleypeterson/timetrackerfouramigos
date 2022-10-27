import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { HttpService } from '../services/http.service';
import { ICourse } from '../interfaces/ICourse';
import {IUser} from "../interfaces/IUser";
import { NULL_EXPR } from '@angular/compiler/src/output/output_ast';
import { ICourseRequest } from '../interfaces/ICourseRequest';

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

  }


  // get the user's courses:
  // get courses where course request user ID and = current user ID
  // and where status = 1, and active = 0
  // and where course request course ID = Course course ID

  getUserCourses(): void {
    this.httpService.getUserCourses(this.user.userID).subscribe((_courses: any) => { this.courses = _courses });

    let payload = {
      username: this.user.username,
    }
    //Gets user from database
    this.httpService.getUser(payload).subscribe((_user: any) =>
    {
      this.userTypeHolder = _user
      //Allow user to create courses if they are an instructor
      if(this.userTypeHolder.type == "Instructor")
      {
        this.isInstructor = true;
      }
      else
      {
        this.isInstructor = false;
      }
    });




  }


  // get the user's groups





  
  public pageTitle = 'TimeTrackerV2 | Dashboard'

}
