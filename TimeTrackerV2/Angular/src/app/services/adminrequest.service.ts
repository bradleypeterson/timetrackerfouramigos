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

  //Filtered requests for when the admin searches for a particular user's requests
  filteredRequests: IAdminRequest[] = [];

  //Emits the requests back to the requests modal
  requestSource = new BehaviorSubject<IAdminRequest[]>([]);
  sharedRequests = this.requestSource.asObservable();

  //Emits the selected user when the admin clicks the account button on the request modal
  //opens the user account modal of the selected user
  userAccountSource = new BehaviorSubject<number>(-1);
  sharedAccountSource = this.userAccountSource.asObservable();

  //Tells the admin dash user table if a request was edited so the table can refresh
  updateUserTable = new BehaviorSubject<boolean>(false);
  _updateUserTable = this.updateUserTable.asObservable();

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
    this.updateUserTable.next(true);
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

  //Saves any request that has been altered and sends them to the database to be saved
  saveModifiedRequests(userID: number){

    this.requests.forEach((request) => {
      if (request.status != "pending"){
        request.isActive = false;
        request.reviewerID = userID;
        this.modifiedRequests.push(request);
      }
    });

    this.httpService.updateAdminRequests(this.modifiedRequests).subscribe(() => {
      this.modifiedRequests = [];
      this.getRequests();
    });

  }

  //Fires when the user searched for a request using the search text box
  filter(searchTerm: string){

    //Returns all users if the search bar is blank
    if(searchTerm == "" || searchTerm == null){
      this.filteredRequests = this.requests;
      return;
    }

    searchTerm = searchTerm.toLowerCase();

    this.filteredRequests = this.requests.filter((request: IAdminRequest) => {
      return request.username?.toLowerCase() == searchTerm;
    });

    this.requestSource.next(this.filteredRequests);

  }

  //Fires when any of the radio buttons are pressed to filter the request table
  radioFilter(type: string){

    if (type == 'all') {
      this.filteredRequests = this.requests;
    } else {

      this.filteredRequests = this.requests.filter((request: IAdminRequest) => {

        if (type === 'student') {
          if (request.type === 'Basic' || request.type === 'Student') {
              return true;
          }
        }

        return request.type?.toLowerCase() == type;
      })

    }

    this.requestSource.next(this.filteredRequests);

  }

  //Opens modal for the user when the account button is clicked on the request modal
  //Whole request has to be passed in otherwise the html won't compile for some reason
  openAccount(request: IAdminRequest){
    this.userAccountSource.next(request?.userID as number);
    this.closeModal();
  }


}
