import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { HttpService } from '../services/http.service';
import { ICourse } from '../interfaces/ICourse';
import {IUser} from "../interfaces/IUser";
import { NULL_EXPR } from '@angular/compiler/src/output/output_ast';


@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})

export class CoursesComponent implements OnInit {
  public pageTitle = 'TimeTrackerV2 | Courses'
  public errMsg = '';
  public user: any = JSON.parse(localStorage.getItem('currentUser') as string);
  public courses: ICourse[] = [];
  public userTypeHolder: IUser;
  
  // for getting the course that was clicked on
  public currCourse?: ICourse;

  public bvis = false;

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
      id?: number;
      isActive?: boolean;
      lastName?: string;
      password?: string;
      salt?: string;
      type?: string;
      username?: string;
    }
  }

  ngOnInit(): void {
    this.getCourses();
  }

  //Gets all the courses from the database, can be called to update the list of courses without reloading the page
  getCourses(): void {
    this.httpService.getCourses().subscribe((_courses: any) => { this.courses = _courses });

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

  //Forms for creating a new course
  courseForm = this.formBuilder.group({
    courseName: '',
    description: '',
  });

  // changes the value of bvis to show the hidden form
  revealForm(): void {
    this.bvis = true;
  }

  // hide form when clicking cancel?
  hideForm(): void {
    this.bvis = false; // set to false
    //location.reload(); // refresh the page
  }

  // pass in the course that was clicked on
  joinCourse(cId : any): void {

    // make sure they aren't an instructor
    if(this.isInstructor == false) {
      // create payload to hold courseRequest data
      let payload2 = {
        userID: this.user['userID'],
        courseID: cId.courseID,
        instructorID: cId.instructorID,
        isActive: true,
        reviewerID: null,
        status: false,

      }

      // insert the data into the course request table
      this.httpService.insertCourseRequest(payload2).subscribe({
        next: data => {
          this.errMsg = "";
          //this.router.navigate(['./']);
          //location.reload(); // refresh the page
        },
        error: error => {
          this.errMsg = error['error']['message'];
        }
      });
    }

    

  }

  createCourse(): void {
    //Payload for the server to accept.
    //Change the fields to get data from the form
    //check the register.component.ts page for an example of
    //how to do this.
    //Double check the database with vscode to make sure that it is working

    // gets the values from the form,
    // the instructor ID is the current user ID,
    // is active is automatically set to true
    let payload = {
      courseName: this.courseForm.value['courseName'],
      isActive: true,
      instructorID: this.user['userID'],
      description: this.courseForm.value['description'],
    }

    this.httpService.createCourse(payload).subscribe({
      next: data => {
        this.errMsg = "";
        //this.router.navigate(['./']);
        //location.reload(); // refresh the page
        this.courseForm.reset(); //Clears the form data after submitting the data.
        this.getCourses();
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });

    //this.http.post<any>('http://localhost:8080/createCourse/', payload, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
    //  next: data => {
    //    this.errMsg = "";
    //    localStorage.setItem('currentCourse', JSON.stringify(data['course']));
    //    this.router.navigate(['./course']);
    //  },
    //  error: error => {
    //    this.errMsg = error['error']['message'];
    //  }
    //});
  }

  //Sets the current course in localstorage and navigates the user to the course page
  setCourseAndMove(course: ICourse) {
    this.router.navigate(['./course'], {state:{data: course}});
  }
}
