import { Component, OnInit } from '@angular/core';
import {AdminModalService } from '../services/adminmodal.service';
import { IUser } from '../interfaces/IUser';
import { FormBuilder } from '@angular/forms';
import { HttpClient} from '@angular/common/http';
import { Router } from '@angular/router';
import { HttpService } from '../services/http.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  public errMsg = '';

  user: IUser = JSON.parse(localStorage.getItem('currentUser') as string);
  
  public userTypeHolder: IUser;

  public isActive = this.user.isActive;
  public isInstructor: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private httpService: HttpService,
    public modalService: AdminModalService,
  ) { 
    this.userTypeHolder = new class implements IUser
    {
      firstName?: string;
      userID?: number;
      isActive?: boolean;
      lastName?: string;
      password?: string;
      salt?: string;
      type?: string;
      username?: string;
    }
  }

  ngOnInit(): void {
    //this.getUser();
    //this.setActive();
    
  }

  /*getUser() {
    let payload = {
      username: this.user.username,
    }
    //Gets user from database
    this.httpService.getUser(payload).subscribe((_user: any) =>
    {
      this.userTypeHolder = _user;
      //Allow user to create courses if they are an instructor
      if(this.userTypeHolder.type == "Instructor")
      {
        this.isInstructor = true;
      }
      else
      {
        this.isInstructor = false;
      }
    });
  }*/

  /*setActive() {
    if (this.userTypeHolder.isActive == true) {
      this.isActive = true;
      this.userActive = "active";
    }
    else {
      this.isActive = false;
      this.userActive = "inactive";
    }
    console.log(this.isActive);
  }*/

  passwordForm = this.formBuilder.group({
    currentpassword: '',
    newpassword: '',
    repeatpassword: '',
  });

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

  onSubmit() {

    let payload = {
      
      currentpassword: this.passwordForm.value['currentpassword'],
      newpassword: this.passwordForm.value['newpassword'],
      repeatpassword: this.passwordForm.value['repeatpassword'],
      userID: this.user.userID,
    }

    this.httpService.changePass(payload).subscribe({
      next: data => {
        this.errMsg = "";
        //location.reload();
        this.passwordForm.reset(); //Clears the form data after submitting the data.
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });


  }


  changeActive() {
    let payload = {
      activeStat: !this.isActive,
      userID: this.user.userID,
    }

    console.log(payload);

    this.httpService.changeActive(payload).subscribe({
      next: data => {
        this.errMsg = "";

        this.user = JSON.parse(localStorage.getItem('currentUser') as string);
        this.isActive = this.user.isActive;
        //location.reload();
        //this.getUser();
        //this.setActive();
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });


  }




}
