import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommsService } from '../comms.service';
import { HttpService } from '../services/http.service';
import { IUser } from '../interfaces/IUser';
import { ResetPassComponent } from './reset-pass/reset-pass.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, AfterViewInit {
  @ViewChild(ResetPassComponent) resetComp: any;

  //user: IUser[] = [];
  public errMsg = '';
  public user: any;
  public display = false;

  constructor(
    private data: CommsService,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private httpService: HttpService
  ) {}

  ngOnInit(): void {
    //Subscribes to the CommsService for username updates
    this.getUser()

  }

  ngAfterViewInit(): void {}

  checkoutForm = this.formBuilder.group({
    username: '',
    password: '',
  });

  redirect(_user: any): void {
    console.log(_user.username)
    if (_user.username !== null) {
      console.log('redirecting from login because you are logged in')
      this.router.navigate(['./dashboard']);
    }

  }


  getUser(): void
  {
    //get user cookie data
    this.httpService.getCookie().subscribe((_users: any) => {
      this.user = _users;
      console.log(this.user)
     
      //redirect user if they are already logged in
          if (this.user.type == 'Instructor')
          {
              this.data.changeInstructor(true);
            }
            else
            {
                this.data.changeInstructor(false);
            }
            this.data.changeUserName(this.user.username);
            this.data.changeLogin('Logout');
            this.redirect(this.user)

        
    });
  }

  //Actives when the user clicks on the login button on the form
  onSubmit(): void {
    //console.log("Username: " + this.checkoutForm.value['username'] + " | Password: " + this.checkoutForm.value['password']);

    let payload = {
      username: this.checkoutForm.value['username'],
      password: this.checkoutForm.value['password'],
    };

    //Subscribes to an observable and logs the user in if the api approves the login
    //displays error message if there as a login issue
    this.httpService.login(payload).subscribe({
      next: (data) => {
        this.errMsg = '';
        //localStorage.setItem('currentUser', JSON.stringify(data['user']));
        this.getUser()
        this.router.navigate(['./dashboard']);
      },
      error: (error) => {
        this.errMsg = error['error']['message'];
      },
    });
  }

  //Changes display to login or reset password
  showReset() {
    this.display = this.display ? false : true;
  }

  //Checks if the user has and active or accepted reset password request
  checkReset() {}
}
