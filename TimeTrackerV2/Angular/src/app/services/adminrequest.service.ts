import { Injectable } from '@angular/core';
import {HttpService} from "./http.service";
import {IAdminRequest} from "../interfaces/IAdminRequest";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AdminRequestService {

  public modalDisplay: boolean = false;

  requests: IAdminRequest[] = [];

  //Holds requests data for when they come in from the database, used
  //when the user clicks the reset button on the modal
  modifiedRequests: IAdminRequest[] = [];

  filteredRequests: IAdminRequest[] = [];

  requestSource = new BehaviorSubject<IAdminRequest[]>([]);
  sharedRequests = this.requestSource.asObservable();

  constructor(private httpService: HttpService) {
    this.getRequests();
  }

  getRequests(){
    this.httpService.getAdminRequests().subscribe((_requests:IAdminRequest[]) => {
      this.requests = _requests;
      this.filteredRequests = _requests;
      this.requestSource.next(this.filteredRequests);
    });
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
        selectedRequest.isActive = false;
        return;
      }

      if (selectedRequest.status != "pending"){

        if ((selectedRequest.status == "approved" && mod == "approved") ||
            (selectedRequest.status == "denied" && mod == "denied")) {
          selectedRequest.status = "pending";
          selectedRequest.isActive = true;
          return;
        }

        if (selectedRequest.status != mod){
          selectedRequest.status = mod;
          selectedRequest.isActive = false;
          return
        }
      }

    }
  }

  //Approves all active requests
  approveAll(){
    this.requests.forEach((request: IAdminRequest) => {
      request.status = "approved";
    });
  }

  //Denies all active requests
  denyAll(){
    this.requests.forEach((request: IAdminRequest) => {
      request.status = "denied";
    });
  }

  //Resets the status of all requests back to pending
  reset(){

    this.requests.forEach((request) => {
      request.status = "pending";
    })


  }

  saveModifiedRequests(){

    this.requests.forEach((request) => {
      if (request.status != "pending"){
        request.isActive = false;
        request.reviewerID = 4; //Change this to session variable of the current admin user !!!!!!!!!!!!!!!!!!!!!!!!!!!
        this.modifiedRequests.push(request);
      }
    });

    this.httpService.updateAdminRequests(this.modifiedRequests).subscribe(() => {
      this.modifiedRequests = [];
      this.getRequests();
    });

  }

  filter(searchTerm: string){

    //Returns all users if the search bar is blank
    if(searchTerm == "" || searchTerm == null){
      this.filteredRequests = this.requests;
      return;
    }

    searchTerm = searchTerm.toLowerCase();
    console.log("filter: " + searchTerm);

    this.filteredRequests = this.requests.filter((request: IAdminRequest) => {
      return request.username?.toLowerCase() == searchTerm;
    })



  }

  radioFilter(type: string){

    console.log(type);

    if (type == 'all') {
      this.filteredRequests = this.requests;
    } else {

      this.filteredRequests = this.requests.filter((request: IAdminRequest) => {
        return request.type?.toLowerCase() == type;
      })

    }

    this.filteredRequests.forEach((o) => {
      console.log(o);
    })

    this.requestSource.next(this.filteredRequests);

  }

  //For debugging
  printRequests(){
    this.requests.forEach((o) => {
      console.log(o);
    });

    console.log("\n");
  }




}
