import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {LoginComponent} from "../login.component";

@Component({
  selector: 'app-reset-pass',
  templateUrl: './reset-pass.component.html',
  styleUrls: ['./reset-pass.component.css']
})
export class ResetPassComponent implements OnInit, AfterViewInit {


  constructor(private formBuilder: FormBuilder, private login: LoginComponent) { }

  public errMsg = '';

  checkoutForm = this.formBuilder.group({
    password: '',
    confirmPassword: ''
  });

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

  onSubmit()
  {

  }

  changeDisplay()
  {
    this.login.showReset();
  }

}
