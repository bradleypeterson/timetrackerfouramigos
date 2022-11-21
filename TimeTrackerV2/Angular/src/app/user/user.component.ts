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

  public isActive = this.user.isActive;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private httpService: HttpService,
    public modalService: AdminModalService,
  ) { }

  ngOnInit(): void {
    
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
        //location.reload();
        this.isActive = !this.isActive;
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });


  }




}
