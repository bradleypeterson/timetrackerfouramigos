import { Component, OnInit } from '@angular/core';
import { ICourseRequest} from "../interfaces/ICourseRequest";
import { HttpService } from '../services/http.service';
import {IUser} from "../interfaces/IUser";

@Component({
  selector: 'app-instructor',
  templateUrl: './instructor.component.html',
  styleUrls: ['./instructor.component.css']
})
export class InstructorComponent implements OnInit {

  public courseRequests?: ICourseRequest[] = [];
  public errMsg = '';
  public user: any = JSON.parse(localStorage.getItem('currentUser') as string);
  public currUser?: IUser;


  constructor(private httpService: HttpService) {}

  ngOnInit(): void
  {
    this.getCourseRequestList();
    let payload = {
      username: this.user.username,
    }
    //Gets user from database
    this.httpService.getUser(payload).subscribe((_user: any) => {this.currUser = _user});

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
        //this.router.navigate(['./']);
        //location.reload(); // refresh the page
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

}
