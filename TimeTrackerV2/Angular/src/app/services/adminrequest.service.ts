import { Injectable } from '@angular/core';
import {HttpService} from "./http.service";
import {IAdminRequest} from "../interfaces/IAdminRequest";

@Injectable({
  providedIn: 'root'
})
export class AdminRequestService {

  public modalDisplay: boolean = false;
  request: any;

  adminRequests: IAdminRequest[] = [];

  msg: string = "";

  constructor(private httpService: HttpService) { }


  showModal() {
    this.modalDisplay = true;
  }

  closeModal() {
    this.modalDisplay = false;
  }
}
