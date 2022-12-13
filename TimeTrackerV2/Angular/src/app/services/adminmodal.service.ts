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

  //Used to open or close the modal
  public modalDisplay: boolean = false;

  //The current user who has been selected
  public user: any;


  msg: string = "";

  //The sql query that pulls course, project, and group data sends it all back as one big payload
  //The data is filtered and added to their own respective arrays that follow below

  //Lets the modal know if it was opened from the requests modal or not
  openedFromRequests: boolean = false;

  //Holds course info  after courses have been separated from database call
  courseInfo: object[] = []

  //Holds project info after projects have been separated from database call
  projectInfo: object[]  = []

  //Holds group info  after group have been separated from database call
  groupInfo: object[] = []

  //List of usernames used to determine if a username already exists if an admin tries to change the username on the account.
  listOfUserNames: string[] = [];

  //Emits a refresh boolean to refresh the user table on the admin dash if a change has been made in the user account modal
  private _refreshSource = new BehaviorSubject<boolean>(false)
  _refresh = this._refreshSource.asObservable();

  //Following three observables used to send course, project, and group information back to the user account modal
  private _courseInfoSource = new BehaviorSubject<object[]>(this.courseInfo);
  _courseSource = this._courseInfoSource.asObservable();

  private _projectInfoSource = new BehaviorSubject<object[]>(this.projectInfo);
  _projectSource = this._projectInfoSource.asObservable();

  private _groupInfoSource = new BehaviorSubject<object[]>(this.groupInfo);
  _groupSource = this._groupInfoSource.asObservable();


  constructor( private httpService: HttpService,
               private requestService: AdminRequestService,
              ) { }

  //Opens the user account modal and sets if the modal was opened from the request modal or not
  showModal(_openedFromRequests: boolean){
    this.modalDisplay = true;
    this.openedFromRequests = _openedFromRequests;

  }

  //Closes the modal
  closeModal(){
    this.modalDisplay = false;
    if (this.openedFromRequests){
      this.openedFromRequests = false;
      this.requestService.showModal();
    }
  }

  //Gets the data about the user for the modal
  create(user: IUser, _listOfUserNames: string[]){
    this.user = user;
    this.listOfUserNames = _listOfUserNames;
    this.courseInfo = [];
    this.projectInfo = [];
    this.groupInfo = [];
    this.getTableData()
  }

  //Calls the httpService to update the user's data on the database
  //Emits a true event if update was successful
  updateUser(user: IUser){

    if(!this.listOfUserNames.includes(user.username as string)) {

      this.httpService.updateUser(user).subscribe(  {
        next: data => {
          this.closeModal();
          this.invokeRefresh();
        },
        error: error => {
          this.msg = error['error']['message'];
        }
      });

    } else {
      alert("Username already exists!");
    }


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

  //Sets the selected users password back to a default password
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

  //Pulls the course, project, and group data from the database in one big query
  //The data is then filtered before being added to their own arrays and passed back to the modal
  getTableData(){
    this.httpService.getCourseAndGroupInfoByID(this.user.userID).subscribe((info) => {

      console.log("Info");
      console.log(info);

      this.separateCoursesInfo(info);
      this.separateProjectInfo(info);
      this.separateGroupInfo(info);

      this._courseInfoSource.next(this.courseInfo);
      this._projectInfoSource.next(this.projectInfo);
      this._groupInfoSource.next(this.groupInfo);


    });
  }

  //Separates the course information from the returned sql query
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

  //Separates the project information from the returned sql query
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

  //Separates the group information from the returned sql query
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
