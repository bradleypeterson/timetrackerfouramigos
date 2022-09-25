import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import {Router} from '@angular/router';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})

export class CourseComponent implements OnInit {
  public pageTitle = 'TimeTrackerV2 | Course'
  public errMsg = '';
  private item;
  public courseName;
  public courseDescription;
    //formBuilder: any;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
  ) { 
    this.item = localStorage.getItem('currentCourse');
    console.log("The current course is: " + this.item);
    if(this.item) {
      this.item = JSON.parse(this.item);
      this.courseName = this.item[0];
      this.courseDescription = this.item[3];
    }
  }

  ngOnInit(): void {
  }

  CourseForm = this.formBuilder.group({
    courseName: '',
    isActive: '',
    instructorID: '',
    description: '',
  });

  // creates courses -- automatically gives the course ID
  // it worked once, but it's not working anymore...
  onSubmit(): void {
    let payload = {
      courseName: this.CourseForm.value['courseName'],
      isActive: this.CourseForm.value['isActive'],
      instructorID: this.CourseForm.value['instructorID'],
      description: this.CourseForm.value['description'],
    }

    this.http.post<any>('http://localhost:8080/course/', payload, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        this.router.navigate(['./']);
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

  createProject(): void {
    let payload = {
      projectName: 'New Project',
      isActive: true,
    }
    console.log(payload);

    this.http.post<any>('http://localhost:8080/createProject/', payload, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        localStorage.setItem('currentProject', JSON.stringify(data['project']));
        this.router.navigate(['./project']);
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

}
