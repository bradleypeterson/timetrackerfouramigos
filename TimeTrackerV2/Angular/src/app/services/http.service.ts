import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IUser } from '../interfaces/IUser';
import { ICourse } from '../interfaces/ICourse';
import {ICourseRequest} from "../interfaces/ICourseRequest";
import {IProject } from '../interfaces/IProject';
import {IGroup} from "../interfaces/IGroup";
import {IGroupAssignment} from "../interfaces/IGroupAssignment";
import {animate} from "@angular/animations";



//A service for making http requests to and from the server

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  //Base backend url
  private apiUrl: string = 'http://localhost:8080/';

  //html header
  private httpOptions = {
    headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" })
  };

  constructor(private http:HttpClient) { }

  //Returns a json array of users data -- username, firstname, lastname, type, isActive
  getUsers(): Observable<IUser[]> {
    return this.http.get<IUser[]>(this.apiUrl + 'getusers');
  }
  //Returns user from server db
  getUser(payload: any): Observable<any>
  {
    return this.http.post<IUser>(this.apiUrl + 'getuser', payload, this.httpOptions)
  }

  //Updates the user data on the database
  updateUser(user: IUser): Observable<any>{
    return this.http.post<IUser>(this.apiUrl + `updateuserbyid/${user.userID}`, user, this.httpOptions);
  }

  //Deletes the passed in user from the database
  deleteUser(user: IUser): Observable<any>{
    return this.http.post<IUser>(this.apiUrl + `deleteuserbyid/${user.userID}`, user, this.httpOptions);
  }

  //Returns all course requests
  getCourseRequests(): Observable<ICourseRequest[]>
  {
    return this.http.get<ICourseRequest[]>(this.apiUrl + 'getcourserequests');
  }

  // returns all course requests, given a user ID, which are still active
  getActiveCourseRequests(): Observable<ICourseRequest[]>
  {
    return this.http.get<ICourseRequest[]>(this.apiUrl + 'getactivecourserequests');
  }

  // returns all course requests, given a user ID, which are accepted
  getUserCourseRequests(id: number): Observable<ICourseRequest[]>
  {
    return this.http.get<ICourseRequest[]>(this.apiUrl + `getusercourserequests/${id}`);
  }
  //Returns all students in a course
  getCourseStudents(id: number): Observable<ICourseRequest[]>
  {
    return this.http.get<ICourseRequest[]>(this.apiUrl + `getcoursestudents/${id}`, this.httpOptions);
  }

  //Joins group based on userID and groupID
  joinGroup(payload: any): Observable<any>
  {
    return this.http.post<any>(this.apiUrl + 'joingroup', payload, this.httpOptions);
  }

  //Leaves group based on userID and groupID
  leaveGroup(payload: any): Observable<any>
  {
    return this.http.post<any>(this.apiUrl + 'leavegroup', payload, this.httpOptions);
  }

  //Updates passed course request
  updateCourseRequest(payload: any): Observable<any>
  {
    return this.http.post<any>(this.apiUrl + 'updatecourserequest', payload, this.httpOptions);
  }

  // add entry to course request table
  insertCourseRequest(payload: any): Observable<any>
  {
    return this.http.post<any>(this.apiUrl + 'insertcourserequest', payload, this.httpOptions);

  }

  // return single course
  returnCourse(payload: any): Observable<any>
  {
    return this.http.post<any>(this.apiUrl + 'getcourse', payload, this.httpOptions);
  }

  getCoursesOnly(): Observable<any>
  {
    return this.http.get<any>(this.apiUrl + 'getcoursesonly');
  }

    //Request login authorization from the server
  login(payload: any): Observable<any> {

    return this.http.post<any>(this.apiUrl + 'login', payload, this.httpOptions);

  }

  //Submits user data to register the user on the server.
  register(payload: any): Observable<any> {

    return this.http.post<any>(this.apiUrl + 'register', payload, this.httpOptions);

  }

  //Creates a course for the user
  createCourse(payload: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'createCourse', payload, this.httpOptions);
  }

  //Returns courses from server db
  getCourses(): Observable<ICourse[]> {
    return this.http.get<ICourse[]>(this.apiUrl + 'getcourses');
  }

  //Returns all courses for an instructor
  getInstructorCourses(id: number): Observable<any>
  {
    return this.http.get<any>(this.apiUrl + `getinstructorcourses/${id}`, this.httpOptions);
  }
  //Returns all projects for an instructor
  getInstructorProjects(id: number): Observable<any>
  {
    return this.http.get<any>(this.apiUrl + `getinstructorprojects/${id}`, this.httpOptions);
  }
  //Returns all groups in a project
  getProjectGroups(id: number): Observable<any>
  {
    return this.http.get<any>(this.apiUrl + `getprojectgroups/${id}`, this.httpOptions);
  }


  // get the user's courses from user ID
  getUserCourses(id: number): Observable<ICourse[]> {
    return this.http.get<ICourse[]>(this.apiUrl + `getusercourses/${id}`);
  }

  //Returns courses and course requests from server db
  getCourseAndRequests(): Observable<ICourse[]> {
    return this.http.get<ICourse[]>(this.apiUrl + 'getcoursesandrequests');
  }

  //Gets all the projects from a course based on course id
  getProjectsByCourseID(id: number): Observable<IProject[]> {
    return this.http.get<IProject[]>(this.apiUrl + `getprojectsbycourseid/${id}`);
  }

  // get the user's projects from user ID
  getUserProjects(id: number): Observable<ICourse[]> {
    return this.http.get<ICourse[]>(this.apiUrl + `getuserprojects/${id}`);
  }

  //Creates a project for a course
  createProject(payload: any): Observable<any> {
    console.log("We are here");
    return this.http.post<any>(this.apiUrl + 'createProject', payload, this.httpOptions);
  }

  getGroups(id: number){
    console.log(this.apiUrl + `getgroupsbyprojectid/${id}`);
    return this.http.get<IGroup[]>(this.apiUrl + `getgroupsbyprojectid/${id}`);
  }

  createGroup(payload: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + `createGroup`, payload, this.httpOptions);
  }

  //Return a list of all group assignments for a user
  getGroupAssignments(id: number): Observable<IGroupAssignment[]>
  {
    return this.http.get<IGroupAssignment[]>(this.apiUrl + `getgroupassignments/${id}`);
  }

  //Returns a list of all groups a user is in
  getUserGroups(id: number): Observable<IGroup[]>
  {
    return this.http.get<IGroup[]>(this.apiUrl + `getusergroups/${id}`);
  }

  //Returns a list of all users in a group
  getGroupUsers(groupID: number): Observable<IUser[]>
  {
    return this.http.get<IUser[]>(this.apiUrl + `getgroupusers/${groupID}`);
  }

  //Returns a list of all time cards for a users group
  getTimeCards(payload: any): Observable<IUser[]>
  {
    return this.http.post<IUser[]>(this.apiUrl + `getusergrouptimecards`, payload, this.httpOptions);
  }

  //Creates a new time card
  createTimeCard(payload: any): Observable<any>
  {
    return this.http.post<any>(this.apiUrl + `createtimecard`, payload, this.httpOptions);
  }

  //Delete selected time card
  deleteTimeCard(payload: any): Observable<any>
  {
    return this.http.post<any>(this.apiUrl + `deletetimecard`, payload, this.httpOptions);
  }

  //Resets the user's to a default password
  resetPassword(user: IUser): Observable<any>{
    return this.http.post<any>(this.apiUrl + `resetPassword/${user.userID}`, user, this.httpOptions);
  }

  //Updates the given timecard
  updateTimeCard(payload: any): Observable<any>
  {
    return this.http.post<any>(this.apiUrl + `updatetimecard`, payload, this.httpOptions);
  }

  //Leaves course based on userID and courseID
  leaveCourse(payload: any): Observable<any>
  {
    return this.http.post<any>(this.apiUrl + 'leavecourse', payload, this.httpOptions);
  }


}
