import { Injectable } from '@angular/core';
import {HttpService} from "./http.service";
import {IAdminRequest} from "../interfaces/IAdminRequest";

@Injectable({
  providedIn: 'root'
})
export class AdminRequestService {

  public modalDisplay: boolean = false;

  requests: IAdminRequest[] = [];

  modifiedRequests: IAdminRequest[] = [];




  msg: string = "";

  constructor(private httpService: HttpService) {
    this.httpService.getAdminRequests().subscribe((_requests:IAdminRequest[]) => {
      this.requests = _requests;
    })
  }

 //Opens the modal
  showModal() {
    this.modalDisplay = true;
  }
  //closes the modal
  closeModal() {
    this.modalDisplay = false;
  }

  //Changes the status of the request to approved, denied, or back to pending
  modifyRequest(mod: string, selectedRequest: IAdminRequest){

    if (selectedRequest) {

      if (selectedRequest.status == "pending"){
          selectedRequest.status = mod;

          return;
      }

      if (selectedRequest.status != "pending"){

        if ((selectedRequest.status == "approved" && mod == "approved") ||
            (selectedRequest.status == "denied" && mod == "denied")) {
          selectedRequest.status = "pending";
          return;
        }

        if (selectedRequest.status != mod){
          selectedRequest.status = mod;
          return
        }
      }

    }
  }




}
