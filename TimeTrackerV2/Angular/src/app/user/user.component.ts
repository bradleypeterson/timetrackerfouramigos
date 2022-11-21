import { Component, OnInit } from '@angular/core';
import { IUser } from '../interfaces/IUser';
import { FormBuilder } from "@angular/forms";
import {HttpService} from "../services/http.service";

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  user: IUser = JSON.parse(localStorage.getItem('currentUser') as string);

  constructor(public formBuilder: FormBuilder,
              private httpService: HttpService) { }

  ngOnInit(): void {
  }

  changePasswordForm = this.formBuilder.group({
    newPassword: '',
    repeatPassword: '',
  });


  //Changes the users password at their request
  changePassword(){

    let newPassword = this.changePasswordForm.value['newPassword'];
    let repeatPassword = this.changePasswordForm.value['repeatPassword'];

    if (newPassword !== repeatPassword){
      alert('Passwords must match!');
      this.changePasswordForm.reset();
      return;
    }


    let payload = {
      newPass: newPassword,
      user: JSON.parse(localStorage.getItem('currentUser') || "{}").userID
    }

    this.httpService.updatePassword(payload).subscribe({
      next: data => {
        this.changePasswordForm.reset();
        alert(data['message']);
      },
      error: error => {
        console.log(error['error']['message']);
      }
    });

  }

}
