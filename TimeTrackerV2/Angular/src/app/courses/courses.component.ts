import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  
  

  constructor(
    private http: HttpClient,
    private router: Router,
    private httpService: HttpService,

    // variable to show if course creation is visible
    public vis = false,
    
  ) {}

  ngOnInit(): void {
    this.httpService.getCourses().subscribe((_courses: any) => { this.courses = _courses });
  }

  createCourse(): void {

    this.vis = true;

    //Payload for the server to accept.
    //Change the fields to get data from the form
    //check the register.component.ts page for an example of
    //how to do this.
    //Double check the database with vscode to make sure that it is working 

    let payload = {
      courseName: 'New Course',
      isActive: true,
      instructorID: this.user['userID'],
      description: "This is for testing again",
    }

    this.httpService.createCourse(payload).subscribe({
      next: data => {
        this.errMsg = "";
        //localStorage.setItem('currentCourse', JSON.stringify(data['course']));
        this.router.navigate(['./course']);
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

}
