import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { HttpService } from '../services/http.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public errMsg = '';

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private httpService: HttpService,
  ) { }

  ngOnInit(): void {
  }

  checkoutForm = this.formBuilder.group({
    username: '',
    password: ''
  });

  //Actives when the user clicks on the login button on the form
  onSubmit(): void {
    //console.log("Username: " + this.checkoutForm.value['username'] + " | Password: " + this.checkoutForm.value['password']);

    let payload = {
      username: this.checkoutForm.value['username'],
      password: this.checkoutForm.value['password'],
    }

    //Subscribes to an observable and logs the user in if the api approves the login
    //displays error message if there as a login issue
    this.httpService.login(payload).subscribe({
      next: data => {
        this.errMsg = "";
        localStorage.setItem('currentUser', JSON.stringify(data['user']));
        this.router.navigate(['./dashboard']);
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

}

  

