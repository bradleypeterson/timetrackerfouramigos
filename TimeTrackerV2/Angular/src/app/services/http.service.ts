import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IUser } from '../interfaces/IUser';
import { ICourse } from '../interfaces/ICourse';
import {IProject } from '../interfaces/IProject';
import {IGroup} from "../interfaces/IGroup";



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

  //Gets all the projects from a course based on course id
  getProjectsByCourseID(id: number): Observable<IProject[]> {
    return this.http.get<IProject[]>(this.apiUrl + `getprojectsbycourseid/${id}`);
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

}
