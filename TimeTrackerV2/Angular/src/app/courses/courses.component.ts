import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../services/http.service';
import { ICourse } from '../interfaces/ICourse';


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

  public bvis = false;
  private cID = 0;
  


  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private httpService: HttpService,
  ) {}

  ngOnInit(): void {
    this.getCourses();
  }

  //Gets all the courses from the database, can be called to update the list of courses without reloading the page
  getCourses(): void {
    this.httpService.getCourses().subscribe((_courses: any) => { this.courses = _courses });
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

  joinCourse(cId : any): void {
    //this.cID = this.courses.findIndex(cId);
    //console.log(this.cID);

    //this.cID = this.courses[cId].courseid?
    // get the current user's id as the student ID


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
