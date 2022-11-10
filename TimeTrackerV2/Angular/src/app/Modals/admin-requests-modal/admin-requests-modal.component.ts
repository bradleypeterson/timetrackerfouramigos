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

  requests: IAdminRequest[] = [];

  constructor(
    private httpService: HttpService,
    private formBuilder: FormBuilder,
    public requestService: AdminRequestService,
  ) {}

  ngOnInit(): void {
    this.requestService.requestSource.subscribe((requestList: IAdminRequest[]) => {
      this.refresh();
    });
  }

  onSubmit() {
    let searchTerm: string = this.requestSearchForm.value['requestSearchTerm'];

    let regex = new RegExp('^[a-zA-Z0-9 _]*$');
    let test = regex.test(searchTerm);

    if (test){
      if (searchTerm == "" || searchTerm == null){
        this.requestService.filter("");
      } else  {
        this.requestService.filter(searchTerm.trim());
      }
    } else {
      alert("Invalid search input! Letters, numbers, and spaces only!");
    }

    this.requestService.requestSource.subscribe((requestList: IAdminRequest[]) => {
      this.refresh();
    });

    this.requestSearchForm.reset();

  }

  refresh(){
    this.requests = this.requestService.filteredRequests;
  }



}
