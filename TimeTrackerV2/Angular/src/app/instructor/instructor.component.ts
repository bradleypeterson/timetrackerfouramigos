import { Component, OnInit } from '@angular/core';
import { ICourseRequest} from "../interfaces/ICourseRequest";
import { HttpService } from '../services/http.service';
import {IUser} from "../interfaces/IUser";
import {ICourse} from "../interfaces/ICourse";
import {animate, state, style, transition, trigger} from '@angular/animations';
import {MatTableDataSource} from "@angular/material/table";

@Component({
  selector: 'app-instructor',
  templateUrl: './instructor.component.html',
  styleUrls: ['./instructor.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class InstructorComponent implements OnInit {

  public courseRequests?: ICourseRequest[] = [];
  public courses: ICourse[] = [];
  public errMsg = '';
  public user: any = JSON.parse(localStorage.getItem('currentUser') as string);
  public currUser?: IUser;
  public coursesDisplay = ["courseName", "description"];
  public studentDisplay = ["studentName"];
  public expandedElement?: CourseDataSource | null;
  public dataSource: MatTableDataSource<any> = new MatTableDataSource<any>()
  public studentsData: CourseDataSource[] = [];

  constructor(private httpService: HttpService) {}

  ngOnInit(): void
  {
    this.getCourseRequestList();
    let payload = {
      username: this.user.username,
    }
    //Gets user from database
    this.httpService.getUser(payload).subscribe((_user: any) => {
      this.currUser = _user
      this.getCourses();

    });

  }

  //Gets a list of all courses for an instructor
  getCourses(): void
  {
    this.httpService.getInstructorCourses(this.currUser?.userID as number).subscribe((_courses: any) => {
      this.courses = _courses
      this.studentsData = [];
      this.courses.forEach(course => {
        this.getStudents(course);
      });
    });
  }

  //Gets a list of all students in a course
  getStudents(course: ICourse): void
  {
    let courseRequest: ICourseRequest[] = [];
    this.httpService.getCourseStudents(course.courseID as number).subscribe((_courserequests: any) => {
      courseRequest = _courserequests;
      if(courseRequest && Array.isArray(courseRequest) && courseRequest.length)
      {
        this.studentsData = [...this.studentsData, {courseName: course.courseName, description: course.description, students: new MatTableDataSource(courseRequest)}];
      }
      else
      {
        this.studentsData = [...this.studentsData, {courseName: course.courseName, description: course.description}];
      }
      this.dataSource = new MatTableDataSource(this.studentsData);
    });

  }


  //Gets a list of all Course Requests
  getCourseRequestList(): void
  {
    this.httpService.getCourseRequests().subscribe((_courseRequests: any) => { this.courseRequests = _courseRequests });
  }
  //Updates the passed course request either accept/decline
  acceptRequest(courseRequest: ICourseRequest): void
  {
    //Change status
    let status = true;
    let reviewer = this.user.userID;
    if(courseRequest.status)
    {
      status = false;
      reviewer = null;
    }
    //Load payload
    let payload = {
      status: status,
      isActive: courseRequest.isActive,
      reviewerID: reviewer,
      requestID: courseRequest.requestID
    }
    //Update course request
    this.httpService.updateCourseRequest(payload).subscribe({
      next: data => {
        this.errMsg = "";
        this.getCourseRequestList();
        this.getCourses();
        //this.router.navigate(['./']);
        //location.reload(); // refresh the page
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });

  }
  //Sets the selected courseRequest isActive to false
  deleteRequest(courseRequest: ICourseRequest): void
  {
    //Load payload
    let payload = {
      status: courseRequest.status,
      isActive: 0,
      reviewerID: this.user.userID,
      requestID: courseRequest.requestID
    }
    //Update course request
    this.httpService.updateCourseRequest(payload).subscribe({
      next: data => {
        this.errMsg = "";
        this.getCourseRequestList();
        this.getCourses();
        //this.router.navigate(['./']);
        //location.reload(); // refresh the page
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

}

export interface CourseDataSource
{
  courseName?: string;
  description?: string;
  students?: ICourseRequest[] | MatTableDataSource<ICourseRequest>
}
