import { Component, OnInit } from '@angular/core';

import { HttpService } from '../services/http.service';
import { User_Interface } from '../interfaces/User_Interface';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dash',
  templateUrl: './admin-dash.component.html',
  styleUrls: ['./admin-dash.component.css']
})

export class AdminDashComponent implements OnInit {

  users:User_Interface[] = []

  constructor(private httpService:HttpService) { }

  ngOnInit(): void {

    //this.httpService.getUsers().subscribe((_users: any) => (this.users = _users));
    this.httpService.getUsers().subscribe((_users) => { this.users = _users; console.log(this.users); });

    //console.log(typeof (this.users));
    //console.log(this.users);
  }

}
