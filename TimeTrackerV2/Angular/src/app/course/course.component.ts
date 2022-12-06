import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Router} from '@angular/router';
import {ICourse} from "../interfaces/ICourse";
import {IProject} from "../interfaces/IProject";
import {HttpService} from "../services/http.service";
import {FormBuilder} from "@angular/forms";
import {ICourseRequest} from "../interfaces/ICourseRequest";

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})

export class CourseComponent implements OnInit {
  public pageTitle = 'TimeTrackerV2 | Course'
  public errMsg = '';
  public user: any;

  public course: any = history.state.data;
  public projects: IProject[] = [];
  public students: ICourseRequest[] = [];

  public bvis: boolean = false;
  public isInstructor: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private httpService: HttpService,
    private formBuilder: FormBuilder,
  ) {}

  projectForm = this.formBuilder.group( {
    projectName: '',
    projectDescription: '',
  });

  ngOnInit(): void {
    this.getUser()
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
      this.getProjects();
      this.getStudents();
    });
  }

  //Gets a list of all students in a course
  getStudents(): void
  {
    this.httpService.getCourseStudents(this.course.courseID as number).subscribe((_students: any) => {
      this.students = _students;
    });
  }

  //Retrieves a list of projects from the database
  //this.course['courseID'] as number
  getProjects(): void {
    this.httpService.getProjectsByCourseID(this.course['courseID']).subscribe( (_projects: any) => {
      this.projects = _projects;
    });
  }

  //Edits value of bvis to display the form
  revealForm(): void {
    if (this.bvis == true) {
      this.bvis = false;
      this.projectForm.reset(); //Clears the form data
    }
    else {
      this.bvis = true;
    }
  }

  //Edits value of bvis to hide the form
  hideForm(): void {
    this.bvis = false;
  }

  //Creates a new database entry in the projects table
  createProject(): void {
    let payload = {
      projectName: this.projectForm.value['projectName'],
      isActive: true,
      courseID: this.course['courseID'],
      description: this.projectForm.value['projectDescription'],
    }

    this.bvis = false;

    //Project must have a name
    if (payload.projectName == "" || payload.projectName == null){
      alert("Project must have a name!");
    } else {
      this.httpService.createProject(payload).subscribe({
        next: data => {
          this.errMsg = "";
          this.projectForm.reset();
          this.getProjects();

        }, error: error => {
          this.errMsg = error['error']['message'];
        }
      });
    }
  }

  //Moves the page to the groups page and passes it the current project
  setProjectAndMove(project: IProject) {
    this.router.navigate(['./project'], {state:{data: project}});

  }

}
