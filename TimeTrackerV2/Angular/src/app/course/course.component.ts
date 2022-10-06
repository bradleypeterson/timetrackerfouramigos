import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Router} from '@angular/router';
import {ICourse} from "../interfaces/ICourse";
import {IProject} from "../interfaces/IProject";
import {HttpService} from "../services/http.service";
import {FormBuilder} from "@angular/forms";

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})

export class CourseComponent implements OnInit {
  public pageTitle = 'TimeTrackerV2 | Course'
  public errMsg = '';

  public course: any = history.state.data;
  public projects: IProject[] = [];

  public bvis: boolean = false;

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
    this.getProjects();
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
    this.bvis = true;
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


    this.httpService.createProject(payload).subscribe( {
      next: data => {
        this.errMsg = "";
        this.getProjects();

      }, error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

  //Moves the page to the groups page and passes it the current project
  setProjectAndMove(project: IProject) {
    this.router.navigate(['./groups'], {state:{data: project}});

  }

}
