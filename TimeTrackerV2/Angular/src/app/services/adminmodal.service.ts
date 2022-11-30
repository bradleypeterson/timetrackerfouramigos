import {EventEmitter, Injectable, Output} from '@angular/core';
import {IUser} from "../interfaces/IUser";
import {HttpService} from "./http.service"

import { BehaviorSubject } from 'rxjs/';
import {AdminRequestService} from "./adminrequest.service";
import { ICourseAndGroupInfo} from "../interfaces/ICourseAndGroupInfo";

@Injectable({
  providedIn: 'root'
})
export class AdminModalService {

  public modalDisplay: boolean = false;
  public user: any;

  msg: string = "";

  openedFromRequests: boolean = false;

  courseInfo = []
  projectInfo = []
  groupInfo = []


  private _refreshSource = new BehaviorSubject<boolean>(false)
  _refresh = this._refreshSource.asObservable();


  constructor( private httpService: HttpService,
               private requestService: AdminRequestService,
              ) { }

  showModal(_openedFromRequests: boolean){
    this.modalDisplay = true;
    this.openedFromRequests = _openedFromRequests;
  }

  closeModal(){
    this.modalDisplay = false;
    if (this.openedFromRequests){
      this.openedFromRequests = false;
      this.requestService.showModal();
    }
  }

  create(user: IUser){
    this.user = user;
    this.getTableData()

  }

  //Calls the httpService to update the user's data on the database
  //Emits a true event if update was successful
  updateUser(user: IUser){

    this.httpService.updateUser(user).subscribe(  {
      next: data => {
        this.closeModal();
        this.invokeRefresh();
      },
      error: error => {
        this.msg = error['error']['message'];

      }
    });


  }

  //Deletes the user based on a passed in user
  //Emits true event if deletion was successful
  deleteUser(user: IUser) {

    this.httpService.deleteUser(user).subscribe(  {
      next: data => {
        this.closeModal();
        this.invokeRefresh();
      },
      error: error => {
        this.msg = error['error']['message'];
        console.log(this.msg);

      }
    });

  }

  setDefaultPassword(user: IUser){
    this.httpService.resetPassword(user).subscribe( {
      next: data => {
        this.closeModal();
        this.invokeRefresh();
      }
    })
  }

  //Yells at the admin-dash component to refresh the table data
  invokeRefresh(){
    this._refreshSource.next(true);
  }

  getTableData(){
    this.httpService.getCourseAndGroupInfoByID(this.user.userID).subscribe((info) => {
      this.separateCoursesInfo(info);
    });
  }

  separateCoursesInfo(info: any){
    info.forEach((item: any) => {


      console.log(info);
      let course = {
        courseID: item.courseID,
        courseName: item.courseName,
        instructorLastName: item.lastName,
        instructorFirstName: item.firstName,
      }

      console.log("Course");
      console.log(course);

      // if (this.courseInfo.length < 1){
      //     // @ts-ignore
      //   this.courseInfo.push(course);
      // }

    })
  }
}
