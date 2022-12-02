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

  courseInfo: object[] = []
  projectInfo: object[]  = []
  groupInfo: object[] = []


  private _refreshSource = new BehaviorSubject<boolean>(false)
  _refresh = this._refreshSource.asObservable();

  private _courseInfoSource = new BehaviorSubject<object[]>(this.courseInfo);
  _courseSource = this._courseInfoSource.asObservable();

  private _projectInfoSource = new BehaviorSubject<object[]>(this.projectInfo);
  _projectSource = this._projectInfoSource.asObservable();

  private _groupInfoSource = new BehaviorSubject<object[]>(this.groupInfo);
  _groupSource = this._groupInfoSource.asObservable();


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

      //console.log(info);

      this.separateCoursesInfo(info);
      this.separateProjectInfo(info);
      this.separateGroupInfo(info);

      this._courseInfoSource.next(this.courseInfo);
      this._projectInfoSource.next(this.projectInfo);
      this._groupInfoSource.next(this.groupInfo);


    });
  }

  separateCoursesInfo(info: any){
    info.forEach((item: any) => {

      let course = {
        courseID: item.courseID,
        courseName: item.courseName,
        instructorLastName: item.lastName,
        instructorFirstName: item.firstName,
      }

      let found: boolean = false;

      this.courseInfo.forEach((_course) => {

        // @ts-ignore
        if (_course.courseID == course.courseID){
          found = true;
        }
      });

      if (!found){
        this.courseInfo.push(course);
      }

    })
  }

  separateProjectInfo(info: any){

    info.forEach((item: any) => {

      let project: object = {
        projectID: item.projectID,
        projectName: item.projectName,
        courseName: item.courseName,
      }

      let found: boolean = false;

      this.projectInfo.forEach((_project) =>{
        // @ts-ignore
        if (_project.projectID == project.projectID) {
            found = true;
        }
      });

      if (!found){
        this.projectInfo.push(project);
      }
    })

  }

  separateGroupInfo(info: any){

    info.forEach((item: any) => {

      let group: object = {
        groupID: item.groupID,
        groupName: item.groupName,
        courseName: item.courseName,
      }

      this.groupInfo.push(group);

    });

  }

}
