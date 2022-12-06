import { Component, OnInit } from '@angular/core';
import {AdminModalService } from '../../services/adminmodal.service';
import {IUser} from "../../interfaces/IUser";
import { FormBuilder } from "@angular/forms";
import {HttpService} from "../../services/http.service";
import {AdminRequestService} from "../../services/adminrequest.service";
import { Subscription} from "rxjs";
import {IAdminRequest} from "../../interfaces/IAdminRequest";

@Component({
  selector: 'app-admin-requests-modal',
  templateUrl: './admin-requests-modal.component.html',
  styleUrls: ['./admin-requests-modal.component.css']
})
export class AdminRequestsModalComponent implements OnInit {

  //Form for searching by username to find user requests
  requestSearchForm = this.formBuilder.group({
    requestSearchTerm: '',
  });

  //The current admin who is editing requests
  user: any = null;

  constructor(
    private httpService: HttpService,
    private formBuilder: FormBuilder,
    public requestService: AdminRequestService,
  ) {}

  requests: IAdminRequest[] = [];
  refreshListener: Subscription | undefined;

  //Loads the requests from the database via the request service when the modal is loaded
  //Also loads the cookie from the database to get the current admin who is editing requests.
  ngOnInit(): void {
    this.refreshListener = this.requestService.sharedRequests.subscribe((requests) => {
      this.requests = requests;
    })

    this.httpService.getCookie().subscribe((_user: any) => {
      this.user = _user;
    })
  }

 //Handles the search text input to find any users who match the search description
 //uses regex to sanitize input and keep away pesky sql injection
  onSubmit() {

    let searchTerm: string = this.requestSearchForm.value['requestSearchTerm'];

    if (searchTerm == null){
      return;
    }

    if (searchTerm == ""){
      this.requestService.filter("");
      return;
    }

    let regex = new RegExp('^[a-zA-Z0-9 _]*$');
    let test = regex.test(searchTerm);

    if (test){
        this.requestService.filter(searchTerm);
    } else {
        alert("Invalid search input! Letters, numbers, and spaces only!");
    }

    this.requestSearchForm.reset();

  }

}
