import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User_Interface } from '../interfaces/User_Interface';


@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private apiUrl: string = 'http://localhost:8080/'

  constructor(private http:HttpClient) { }

  getUsers(): Observable<User_Interface[]> {
    return this.http.get<User_Interface[]>(this.apiUrl + 'getusers');

    //return this.http.get(this.apiUrl + 'getusers')
    //  .pipe(map(res => ({
    //    userID: res.userID,
    //    username: res.userName,

    //  })))
   
  }
}
