import { Component, OnInit } from '@angular/core';
import { IUser } from '../interfaces/IUser';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  user: IUser = JSON.parse(localStorage.getItem('currentUser') as string);

  constructor() { }

  ngOnInit(): void {
  }

  public pageTitle = 'TimeTrackerV2 | User'

}
