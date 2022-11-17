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

  requestSearchForm = this.formBuilder.group({
    requestSearchTerm: '',
  });




  constructor(
    private httpService: HttpService,
    private formBuilder: FormBuilder,
    public requestService: AdminRequestService,
  ) {}

  requests: IAdminRequest[] = [];
  refreshListener: Subscription | undefined;

  ngOnInit(): void {
    this.refreshListener = this.requestService.sharedRequests.subscribe((requests) => {
      this.requests = requests;
    })
  }


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
