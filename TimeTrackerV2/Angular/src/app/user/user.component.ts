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

  user: IUser = JSON.parse(localStorage.getItem('currentUser') as string);

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
    repeatPassword: '',
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
    /*let currPass = ((document.getElementById("currpass") as HTMLInputElement).value);
    let newPass = ((document.getElementById("newpass") as HTMLInputElement).value);
    let repPass = ((document.getElementById("repass") as HTMLInputElement).value);
    */

    let payload = {
      
      password: this.passwordForm.value['password'],
      repeatPassword: this.passwordForm.value['repeatPassword'],
    }


  }

}
