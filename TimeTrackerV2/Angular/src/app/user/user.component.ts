import { Component, OnInit } from '@angular/core';
import { IUser } from '../interfaces/IUser';
import { FormBuilder } from "@angular/forms";

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  user: IUser = JSON.parse(localStorage.getItem('currentUser') as string);

  constructor(public formBuilder: FormBuilder) { }

  ngOnInit(): void {
  }

  changePasswordForm = this.formBuilder.group({
    changePasswordTerm: '',
  });


  changePassword(){

    let currentPassword = this.changePasswordForm.value["changePasswordTerm"];
    let newPassword = this.changePasswordForm.value['changePasswordTerm'];
    let repeatPassword = this.changePasswordForm.value['changePasswordTerm'];

    console.log("Current: " + currentPassword);
    console.log("New: " + newPassword);
    console.log("Repeat " + repeatPassword);

    if (!newPassword === repeatPassword){
      alert('Passwords must match!');
      this.changePasswordForm.reset();
    }



  }

}
