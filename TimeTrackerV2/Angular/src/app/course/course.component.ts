import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Router} from '@angular/router';
import {ICourse} from "../interfaces/ICourse";
import {IProject} from "../interfaces/IProject";
import {HttpService} from "../services/http.service";

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})

export class CourseComponent implements OnInit {
  public pageTitle = 'TimeTrackerV2 | Course'
  public errMsg = '';
  /*private item;
  public courseName;
  public courseDescription;
*/
  public course: any = JSON.parse(localStorage.getItem('currentcourse') as string);
  public projects: IProject[] = []


  constructor(
    private http: HttpClient,
    private router: Router,
    private httpService: HttpService,
  ) {}

  ngOnInit(): void {
    this.getProjects();
  }

  //Retrieves a list of projects from the database
  getProjects(): void {
    console.log(this.course['courseID']);
    this.httpService.getProjectsByCourseID(this.course['courseID'] as number).subscribe( (_projects: any) => {
      this.projects = _projects;
    });
  }

  //Creates a new database entry in the projects table
  createProject(): void {
    let payload = {
      projectName: 'test project 2',
      isActive: true,
      courseID: this.course['courseID'],
      description: "This is a test description",
    }

    this.httpService.createProject(payload).subscribe( {
      next: data => {
        this.errMsg = "";
        this.getProjects();

      }, error: error => {
        this.errMsg = error['error']['message'];
      }
    })

    /*this.http.post<any>('http://localhost:8080/createProject/', payload, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        localStorage.setItem('currentProject', JSON.stringify(data['project']));
        this.router.navigate(['./project']);
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });*/
  }

}
