import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { HttpService } from '../services/http.service';
import { ICourse } from '../interfaces/ICourse';
import {IUser} from "../interfaces/IUser";
import { NULL_EXPR } from '@angular/compiler/src/output/output_ast';
import { ICourseRequest } from '../interfaces/ICourseRequest';


@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})

export class CoursesComponent implements OnInit {
  public pageTitle = 'TimeTrackerV2 | Courses'
  public errMsg = '';
  public courses: ICourse[] = [];
  public userCourses: ICourse[] = [];
  public courseRequests: ICourseRequest[] = [];
  public user: any;
  public default = 0;
  public pointer = "pointer";
  public nothing = "";

  // for getting the course that was clicked on
  public currCourse?: ICourse;

  public bvis = false; // for form visibility
  public bjoin = false; // for join button visibility
  public bleave = false; // for leave button visibility


  //Allow course creation if the user is an Instructor
  public isInstructor: boolean = false;

  constructor(
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private router: Router,
    private httpService: HttpService,) {}

  ngOnInit(): void {
    this.getCourses();
    this.httpService.getCookie().subscribe((_user: any) => {
        this.user = _user;
        if(!this.user.username){
            console.log('redirecting')
            this.router.navigate(['./']);
        }
    });

  }

  //Gets all the courses from the database, can be called to update the list of courses without reloading the page
  getCourses(): void {
    this.httpService.getCourses().subscribe((_courses: any) =>
    {
      this.courses = _courses;
      this.getUser()
    });
  }

  getUser(): void
  {
    this.httpService.getCookie().subscribe((_users: any) => {
      this.user = _users;
      if(!this.user.username){
        console.log('redirecting')
        this.router.navigate(['./']);
    }
      //Allow user to create courses if they are an instructor
      if(_users.type == "Instructor")
      {
        this.isInstructor = true;
      }
      else
      {
        this.isInstructor = false;
      }
      this.getUserCourses();
      this.getUserRequests();
    });
  }


  getUserCourses(): void
  {
    this.httpService.getUserCourses(this.user.userID as number).subscribe((_courses: any) => { this.userCourses = _courses; });
  }




  getUserRequests() {
    //Gets a list of all group assignments the user has and sets the visibility
    this.httpService.getUserCourseRequests(this.user.userID as number).subscribe((_courseRequests: ICourseRequest[]) =>
    {

      this.courseRequests = _courseRequests;
      this.courses.forEach(value =>
      {
        // if it's the user's course request and the course matches and there's a course request
        if(this.courseRequests.some(x => value.courseID === x.courseID)) {
          console.log("User has course: " + value.courseName);
          // console.log("Status = ", this.courseRequests.some(x => x.status));
          // console.log("Active = ", this.courseRequests.some(x => x.isActive));

          // if pending: status is 0, active is 1
          // if rejected: status is 0, active is 0
          // if accepted: statis is 1, active is 1

          // Accepted
          if(this.courseRequests.some(x => x.isActive == true && x.status == true && value.courseID == x.courseID))
          {
            console.log("Course was accepted: " + value.courseName);
            value.leave = true; // the leave button shows
            value.display = false;
            value.pending = false;
            this.default = 1;
          }
          // Pending
          else if(this.courseRequests.some(x => x.isActive == true && x.status == false && value.courseID == x.courseID))
          {
            console.log("Course is pending: " + value.courseName);
            value.display = false;
            value.pending = true; // the pending button shows
            value.leave = false;
            this.default = 2;
          }
          // Deleted
          else
          {
            console.log("Course is deleted: " + value.courseName);
            value.display = true; // the join button shows
            value.pending = false;
            value.leave = false;
            this.default = 3;
          }
        }
        // User hasn't joined
        else
        {
          console.log("User doesn't has course: " + value.courseName);
          value.display = true;
          value.pending = false;
          value.leave = false;
        }
      });
    });
  }



  //Forms for creating a new course
  courseForm = this.formBuilder.group({
    courseName: '',
    description: '',
  });

  // changes the value of bvis to show the hidden form
  revealForm(): void {
    if (this.bvis == true) {
      this.bvis = false;
      this.courseForm.reset(); //Clears the form data
    }
    else {
      this.bvis = true;
    }
  }

  // hide form when clicking cancel?
  hideForm(): void {
    this.bvis = false; // set to false
    this.courseForm.reset(); //Clears the form data
    //location.reload(); // refresh the page
  }

  // pass in the course that was clicked on
  joinCourse(cId : any, event: any): void {
    event.target.disable = true;
    // make sure they aren't an instructor
    if(this.isInstructor == false) {
      // create payload to hold courseRequest data
      let payload2 = {
        userID: this.user.userID,
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
          this.getCourses();
          this.getUserCourses();
        },
        error: error => {
          this.errMsg = error['error']['message'];
        }
      });
    }
  }
  //Leaves the selected course
  leaveCourse(course: any, event: any): void
  {
    event.target.disable = true;
    let payload = {
      userID: this.user.userID,
      courseID: course.courseID
    }
    console.log("userID: " + payload.userID + " courseID: " + payload.courseID);
    this.httpService.leaveCourse(payload).subscribe({
      next: data => {
        this.errMsg = "";
        this.getCourses();
        this.getUserCourses();
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });

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
      instructorID: this.user.userID,
      description: this.courseForm.value['description'],
    }

    this.httpService.createCourse(payload).subscribe({
      next: data => {
        this.errMsg = "";
        //this.router.navigate(['./']);
        //location.reload(); // refresh the page
        this.courseForm.reset(); //Clears the form data after submitting the data.
        this.bvis = false; // hide the form again
        this.getCourses();
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });

  }

  //Sets the current course in localstorage and navigates the user to the course page
  setCourseAndMove(course: ICourse) {
    this.router.navigate(['./course'], {state:{data: course}});
  }
}
