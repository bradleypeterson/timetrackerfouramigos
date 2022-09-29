import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { HttpService } from '../services/http.service';
import { ICourse } from '../interfaces/ICourse';
import { IUser } from '../interfaces/IUser';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})

export class CoursesComponent implements OnInit {
  public pageTitle = 'TimeTrackerV2 | Courses'
  public errMsg = '';
  public user: IUser;

  constructor(
    private http: HttpClient,
    private router: Router,
    private httpService: HttpService,
    
  ) { this.user = JSON.parse(localStorage.getItem('currentUser') as string); }

  ngOnInit(): void {
    console.log(this.user);
  }

  createCourse(): void {

    console.log(this.user.userID);

    //let payload = {
    //  courseName: 'New Course',
    //  isActive: true,
    //  instructorID: this.user.id,
    //  description: "This is temporary for testing",
    //}
    //console.log(payload.courseName);
    //console.log(payload.isActive);
    //console.log(payload.instructorID);
    //console.log(payload.description);

    //this.httpService.createCourse(payload).subscribe({
    //  next: data => {
    //    this.errMsg = "";
    //    //localStorage.setItem('currentCourse', JSON.stringify(data['course']));
    //    this.router.navigate(['./course']);
    //  },
    //  error: error => {
    //    this.errMsg = error['error']['message'];
    //  }
    //});

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
