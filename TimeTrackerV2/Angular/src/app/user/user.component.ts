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
  public errColor = "";
  public showChangedName = false;

  public user: any;
  public fname = "";
  public lname = "";
  public username = "";

  public isActive = false;
  public isInstructor: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private httpService: HttpService,
    public modalService: AdminModalService,){}

  ngOnInit(): void {
    this.getUser();
    //this.setActive();

  }

  getUser()
  {
    //Gets user from database
    this.httpService.getCookie().subscribe((_users: any) => {
      this.user = _users;
      this.fname = _users.firstName;
      this.lname = _users.lastName;
      this.username = _users.username;
      //Allow user to create courses if they are an instructor
      if (_users.type == "Instructor")
      {
        this.isInstructor = true;
      }
      else
      {
        this.isInstructor = false;
      }
      this.isActive = _users.isActive;
    });
  }


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

    this.showChangedName = true;

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
        //this.errMsg = "";
        this.passwordForm.reset(); //Clears the form data after submitting the data.
        this.errColor = "text-success"
        this.errMsg = "Changed Password"
      },
      error: error => {
        this.errColor = "text-danger"
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
        this.getUser();
        //this.setActive();
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });


  }

  requestToBeInstructor(){
    this.httpService.requestToBeInstructor({userID: this.user.userID, userName: this.user.username}).subscribe( {
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
