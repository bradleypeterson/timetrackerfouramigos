import { Component, OnInit } from '@angular/core';
import {AdminModalService } from '../../services/adminmodal.service';
import {IUser} from "../../interfaces/IUser";
import { FormBuilder } from "@angular/forms";
import {HttpService} from "../../services/http.service";
import {AdminRequestService} from "../../services/adminrequest.service";

@Component({
  selector: 'app-admin-requests-modal',
  templateUrl: './admin-requests-modal.component.html',
  styleUrls: ['./admin-requests-modal.component.css']
})
export class AdminRequestsModalComponent implements OnInit {

  requestsSearchForm = this.formBuilder.group({
    requestSearchTerm: '',
  });

  constructor(
    private httpService: HttpService,
    private formBuilder: FormBuilder,
    public requestService: AdminRequestService,
  ) { }

  ngOnInit(): void {
  }

  onSubmit(){

  }

}
