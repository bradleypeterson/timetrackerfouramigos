import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IUser } from '../interfaces/IUser';
import { ICourse } from '../interfaces/ICourse';
import {ICourseRequest} from "../interfaces/ICourseRequest";


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
  //Returns all course requests
  getCourseRequests(): Observable<ICourseRequest[]>
  {
    return this.http.get<ICourseRequest[]>(this.apiUrl + 'getcourserequests');
  }
  //Updates passed course request
  updateCourseRequest(payload: any): Observable<any>
  {
    return this.http.post<any>(this.apiUrl + 'updatecourserequest', payload, this.httpOptions);
  }

    //Request login authorization from the server
  login(payload: any): Observable<any> {

    return this.http.post<any>(this.apiUrl + 'login', payload, this.httpOptions);

  }

  //Submits user data to register the user on the server.
  register(payload: any): Observable<any> {

    return this.http.post<any>(this.apiUrl + 'register', payload, this.httpOptions);

  }

  createCourse(payload: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'createCourse', payload, this.httpOptions);
  }

  //Returns courses from server db
  getCourses(): Observable<ICourse[]> {
    return this.http.get<ICourse[]>(this.apiUrl + 'getcourses');
  }

}
