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

  user: IUser[] = [];

  public userTypeHolder: IUser;

  public isActive = 0;
  public fname = "";
  public lname = "";
  public uID = 0;
  public uname = "";
  public uType = "";
  public uActive = 0;
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
    //get user cookie data
    this.httpService.getCookie().subscribe((_users: any) => {
      this.user = _users;
      this.isActive = _users.isActive;
      this. uID = _users.userID;
      this.fname = _users.firstName;
      this.lname = _users.lastName;
      this.uname = _users.username;
      this.uType = _users.type;
      this.uActive = _users.isActive
      console.log(this.user);
      //redirect user if they are already logged in

    });

  }

  getUser() {
    let payload = {
      username: this.uname,
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
    
  }


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
      this.fname = firstName;
    }

    if (lastName != "") {
      this.lname = lastName;
    }

    if (userName != "") {
      this.uname = userName;
    }

    let payload = {
      username: this.uname,
      firstName: this.fname,
      lastName: this.lname,
      type: this.uType,
      isActive: this.uActive,
      userID: this.uID,
    }

    this.httpService.updateUserPayload(payload).subscribe({
      next: data => {
        this.errMsg = "";
        //location.reload();
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });

  }

  onSubmit() {

    let payload = {

      currentpassword: this.passwordForm.value['currentpassword'],
      newpassword: this.passwordForm.value['newpassword'],
      repeatpassword: this.passwordForm.value['repeatpassword'],
      userID: this.uID,
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
      userID: this.uID,
    }

    console.log(payload);

    this.httpService.changeActive(payload).subscribe({
      next: data => {
        this.errMsg = "";

        this.user = JSON.parse(localStorage.getItem('currentUser') as string);
        this.isActive = this.isActive;
        //location.reload();
        //this.getUser();
        //this.setActive();
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });


  }

  requestToBeInstructor(){
    this.httpService.requestToBeInstructor({userID: this.uID, userName: this.uname}).subscribe( {
        next: data => {
          alert('Request Submitted!');
        },
      error: error => {
          if (error['error']['error'] == "Request already awaiting approval!"){
            alert(error['error']['error']);
          }
      }
    });
  }




}
