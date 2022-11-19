import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {LoginComponent} from "../login.component";
import {HttpService} from "../../services/http.service";

@Component({
  selector: 'app-reset-pass',
  templateUrl: './reset-pass.component.html',
  styleUrls: ['./reset-pass.component.css']
})
export class ResetPassComponent implements OnInit, AfterViewInit {


  constructor(private formBuilder: FormBuilder, private login: LoginComponent, private httpService: HttpService,) { }

  public requestSent = false;
  public errMsg = '';
  public sentClass = "text-success";

  checkoutForm = this.formBuilder.group({
    usernameReset: '',
  });

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

  //Changes the login to reset and back
  changeDisplay()
  {
    this.login.showReset();
  }

  //Sends a password reset request to the admins
  //Shows Pending Password Reset if they have an active request
  //Shows Reset Password if it has been accepted
  //Shows Request Sent if there isn't an active request
  onSubmit()
  {
    if (!this.requestSent) {
      let payload = {
        username: this.checkoutForm.value['username']
      }
      this.httpService.requestPassword(payload).subscribe({
        next: data => {
          this.requestSent = true;
          this.errMsg = "";
        },
        error: error => {
          this.errMsg = error['error']['message'];
        }
      });
    }
  }

}
