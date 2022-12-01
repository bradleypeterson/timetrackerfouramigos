import { Component, OnInit } from '@angular/core';
import { ICourseRequest} from "../interfaces/ICourseRequest";
import { HttpService } from '../services/http.service';
import { Router } from '@angular/router';
import {IUser} from "../interfaces/IUser";
import {ICourse} from "../interfaces/ICourse";
import {animate, state, style, transition, trigger} from '@angular/animations';
import {MatTableDataSource} from "@angular/material/table";
import {IGroup} from "../interfaces/IGroup";
import {IProject} from "../interfaces/IProject";

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
  //Refactor into separate classes

  //region Class Variables

  public errMsg = '';
  public user: any;

  public coursesDisplay = ["students", "courseName", "description"];
  public projectDisplay = ["groups", "projectName", "courseName", "description"];
  public innerGroupDisplay = ["groupName"];
  public studentDisplay = ["studentName"];

  public courseRequests?: ICourseRequest[] = [];

  public courses: ICourse[] = [];
  public expandedElementCourse?: CourseDataSource | null;
  public dataSourceCourses: MatTableDataSource<any> = new MatTableDataSource<any>();
  public studentsData: CourseDataSource[] = [];
  public tempCourse: any;

  public projects: IProject[] = [];
  public expandedElementProject?: ProjectDataSource | null;
  public dataSourceProject: MatTableDataSource<any> = new MatTableDataSource<any>();
  public groupsData: ProjectDataSource[] = [];
  public tempProject: any;
  //endregion

  //region Initial Functions

  constructor(private httpService: HttpService, private router: Router,) {}

  ngOnInit(): void
  {
    this.getCourseRequestList();
    this.getUser()

  }

  getUser(): void
  {
    //Gets user from database
    this.httpService.getCookie().subscribe((_users: any) => {
      this.user = _users;
      this.getCourses();
      this.getProjects();
    });
  }

  //endregion

  //region CourseRequest List

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
    let reviewer: any = this.user.userID;
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

  //endregion

  //region Courses List

  //Gets a list of all courses for an instructor
  getCourses(): void
  {
    this.httpService.getInstructorCourses(this.user?.userID as number).subscribe((_courses: any) => {
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
        this.studentsData = [...this.studentsData, {courseName: course.courseName, description: course.description, courseID: course.courseID, students: new MatTableDataSource(courseRequest)}];
      }
      else
      {
        this.studentsData = [...this.studentsData, {courseName: course.courseName, description: course.description, courseID: course.courseID}];
      }
      this.dataSourceCourses = new MatTableDataSource(this.studentsData);
    });
  }

  //Goto the specific course page
  gotoCourse(course: any): void
  {
    this.tempCourse.courseID = course.courseID;
    this.tempCourse.courseName = course.courseName;
    this.tempCourse.description = course.description;
    this.router.navigate(['./course'], {state:{data: this.tempCourse}});
  }

  //endregion

  //region Projects List
  //Gets the list of projects for an instructor
  getProjects(): void
  {
    this.httpService.getInstructorProjects(this.user?.userID as number).subscribe((_projects: any) => {
      this.projects = _projects
      this.groupsData = [];
      this.projects.forEach(project => {
        this.getProjectGroups(project);
      });
    });
  }
  //Gets a list of groups in a project
  getProjectGroups(project: any): void
  {
    let groups: IGroup[] = [];
    this.httpService.getGroups(project.projectID as number).subscribe((_groups: any) =>{
      groups = _groups;
      if(groups && Array.isArray(groups) && groups.length)
      {
        this.groupsData = [...this.groupsData, {projectName: project.projectName, courseName: project.courseName, description: project.description, projectID: project.projectID, groups: new MatTableDataSource(groups)}];
      }
      else
      {
        this.groupsData = [...this.groupsData, {projectName: project.projectName, courseName: project.courseName, description: project.description, projectID: project.projectID}];
      }
      this.dataSourceProject = new MatTableDataSource(this.groupsData);
    });
  }

  //Navigates to the given project page
  gotoProject(project: any): void
  {
    this.tempProject.projectID = project.projectID;
    this.tempProject.projectName = project.projectName;
    this.tempProject.description = project.description;
    this.tempProject.courseName = project.courseName;
    this.router.navigate(['./project'], {state:{data: this.tempProject}});
  }
  gotoGroup(group: any): void
  {
    this.router.navigate(['./group'], {state:{data: group}});
  }
  //endregion

}

//region Interfaces
export interface CourseDataSource
{
  courseName?: string;
  description?: string;
  courseID?: number
  students?: ICourseRequest[] | MatTableDataSource<ICourseRequest>
}

export interface ProjectDataSource
{
  projectName?: string;
  courseName?: string;
  description?: string;
  projectID?: number;
  groups?: IGroup[] | MatTableDataSource<IGroup>
}

//endregion
