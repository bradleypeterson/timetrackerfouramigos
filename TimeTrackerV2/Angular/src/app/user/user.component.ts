import { Component, OnInit } from '@angular/core';
import {AdminModalService } from '../services/adminmodal.service';
import { IUser } from '../interfaces/IUser';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  user: IUser = JSON.parse(localStorage.getItem('currentUser') as string);

  constructor(
    public modalService: AdminModalService,
  ) { }

  ngOnInit(): void {
    
  }

  public pageTitle = 'TimeTrackerV2 | User'


  changeName() {
    let firstName = ((document.getElementById("firstname") as HTMLInputElement).value);
    let lastName = ((document.getElementById("lastname") as HTMLInputElement).value);
    let userName = ((document.getElementById("username") as HTMLInputElement).value);

    if (firstName != "") {
      this.user.firstName = firstName;
    }

    if (lastName != "") {
      this.user.lastName = lastName;
    }

    if (userName != "") {
      this.user.username = userName;
    }

    this.modalService.updateUser(this.user);

  }

}
