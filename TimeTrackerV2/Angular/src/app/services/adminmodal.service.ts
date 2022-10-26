import { Injectable } from '@angular/core';
import {IUser} from "../interfaces/IUser";
import {HttpService} from "./http.service"

@Injectable({
  providedIn: 'root'
})
export class AdminModalService {

  public modalDisplay: boolean = false;
  public user: any;

  msg: string = "";

  constructor( private httpService: HttpService) { }

  showModal(){
    this.modalDisplay = true;
  }

  closeModal(){
    this.modalDisplay = false;
  }

  create(user: IUser){
    this.user = user;
  }

  updateUser(user: IUser) {

    this.httpService.updateUser(user).subscribe(  {
      next: data => {},
      error: error => {
        this.msg = error['error']['message'];
        return false;
      }
    });

    this.closeModal();

  }
}
