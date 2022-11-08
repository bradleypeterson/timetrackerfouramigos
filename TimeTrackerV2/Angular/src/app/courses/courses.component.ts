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
  public user: any = JSON.parse(localStorage.getItem('currentUser') as string);
  public courses: ICourse[] = [];
  public activeCR: ICourseRequest[] = [];
  public courseRequests: ICourseRequest[] = [];
  public userTypeHolder: IUser;
  public default = 0;

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

  ngOnInit(): void {
    this.getCourses();
    this.getUserRequests();

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

  // THIS IS NOT WORKING RIGHT NOW...
  getUserRequests() {
    //Gets a list of all group assignments the user has and sets the visibility
    this.httpService.getUserCourseRequests(this.user.userID).subscribe((_courseRequests: ICourseRequest[]) =>
    {
      
      this.courseRequests = _courseRequests;
      console.log(this.courseRequests);
      this.courses.forEach(value =>
      {
        

        // if it's the user's course request and the course matches and there's a course request
        if(this.courseRequests.some(x => value.courseID === x.courseID)) {
          
          console.log("course id = ", value.courseID);
          console.log("Status = ", this.courseRequests.some(x => x.status));
          console.log("Active = ", this.courseRequests.some(x => x.isActive));

          // if pending: status is 0, active is 1
          // if rejected: status is 0, active is 0
          // if accepted: statis is 1, active is 1
          
          // if it was accecpted
          if(this.courseRequests.some(x => x.isActive == true && x.status == true))
          {
            console.log("leave btn");
            value.leave = true; // the leave button shows
            value.display = false;
            value.pending = false;
            this.default = 1;
          }
          // if it's still active
          if(this.courseRequests.some(x => x.isActive == true && x.status == false))
          {
            console.log("pending btn");
            value.display = false;
            value.pending = true; // the pending button shows
            value.leave = false;
            this.default = 2;
          }
          // if it's not accepted nor active
          if(this.courseRequests.some(x=> (x.status == false && x.isActive === false))) {
            console.log("join btn");
            value.display = true; // the join button shows
            value.pending = false;
            value.leave = false;
            this.default = 3;
          }
        }
        else {
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
          this.getCourses();
          this.getUserRequests();
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
