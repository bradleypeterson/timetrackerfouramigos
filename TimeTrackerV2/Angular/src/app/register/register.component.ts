import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient} from '@angular/common/http';
import { Router } from '@angular/router';
import { HttpService } from '../services/http.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  public pageTitle = 'TimeTrackerV2 | Register'
  public errMsg = '';
  //Temporary to create an Instructor user
  public userType: string = "Basic";

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private httpService: HttpService,
  ) {}

  ngOnInit(): void {
  }

  registrationForm = this.formBuilder.group({
    username: '',
    firstName: '',
    lastName: '',
    password: '',
    repeatPassword: '',
  });

  onSubmit(): void {
    let payload = {
      username: this.registrationForm.value['username'],
      firstName: this.registrationForm.value['firstName'],
      lastName: this.registrationForm.value['lastName'],
      password: this.registrationForm.value['password'],
      repeatPassword: this.registrationForm.value['repeatPassword'],
      //Temporary to create an Instructor user
      userType: this.userType,
    }


    this.httpService.register(payload).subscribe({
      next: data => {
        this.errMsg = "";
        this.router.navigate(['./']);
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }
  //Temporary to create an Instructor user
  onChange(): void
  {
    if (this.userType == "Basic")
    {
      this.userType = "Instructor";
    }
    else
    {
      this.userType = "Basic";
    }
  }

}
