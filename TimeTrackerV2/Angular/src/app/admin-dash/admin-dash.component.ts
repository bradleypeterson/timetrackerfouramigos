import { Component, OnInit } from '@angular/core';
import { HttpService } from '../services/http.service';
import { IUser } from '../interfaces/IUser';

@Component({
  selector: 'app-admin-dash',
  templateUrl: './admin-dash.component.html',
  styleUrls: ['./admin-dash.component.css']
})

export class AdminDashComponent implements OnInit {

  users:IUser[] = []

  constructor(private httpService:HttpService) { }

  ngOnInit(): void {

    this.httpService.getUsers().subscribe((_users: any) => { this.users = _users});
    
  }

}
