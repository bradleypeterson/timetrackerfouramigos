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

  public requestMessage = "";
  public requestSent = false;
  public requestColor = ""
  public errMsg = '';
  public sentClass = "";

  passwordForm = this.formBuilder.group({
    usernameReset: '',
  });

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

  //Changes the login to reset and back
  changeDisplay()
  {
    this.requestMessage = "";
    this.login.showReset();
  }

  //Sends a password reset request to the admins
  //Shows Pending Password Reset if they have an active request
  //Shows Reset Password if it has been accepted
  //Shows Request Sent if there isn't an active request
  onSubmit()
  {
    this.requestMessage = "";
    this.requestSent = false;
    this.httpService.requestPassword(this.passwordForm.value['usernameReset']).subscribe((_response: any) => {
      //No user with that username
      if (_response["message"] === "incorrect")
      {
        this.requestMessage = "Incorrect Username";
        this.sentClass = "text-danger"
      }
      //Request was sent
      else if (_response["message"] === "success")
      {
        this.requestMessage = "Request Sent";
        this.sentClass = "text-success"
      }
      //Request has already been sent but hasn't been approved yet
      else if (_response["message"] === "pending")
      {
        this.requestMessage = "Request Pending";
        this.sentClass = "text-warning"
      }
      //Request was approved
      else if (_response["message"] == "accepted")
      {
        this.requestMessage = "Request Approved";
        this.sentClass = "text-primary"
      }
      this.requestSent = true;
    });

  }

}
