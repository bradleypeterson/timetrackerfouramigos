import {EventEmitter, Injectable, Output} from '@angular/core';
import {IUser} from "../interfaces/IUser";
import {HttpService} from "./http.service"

import { BehaviorSubject } from 'rxjs/';

@Injectable({
  providedIn: 'root'
})
export class AdminModalService {

  public modalDisplay: boolean = false;
  public user: any;

  msg: string = "";

  private _refreshSource = new BehaviorSubject<boolean>(false)
  _refresh = this._refreshSource.asObservable();


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

  //Calls the httpService to update the user's data on the database
  //Emits a true event if update was successful
  updateUser(user: IUser){

    this.httpService.updateUser(user).subscribe(  {
      next: data => {
        this.closeModal();
        this.invokeRefresh();
      },
      error: error => {
        this.msg = error['error']['message'];

      }
    });


  }

  //Deletes the user based on a passed in user
  //Emits true event if deletion was successful
  deleteUser(user: IUser) {


    this.httpService.deleteUser(user).subscribe(  {
      next: data => {
        this.closeModal();
        this.invokeRefresh();
      },
      error: error => {
        this.msg = error['error']['message'];
        console.log(this.msg);

      }
    });

  }

  setDefaultPassword(user: IUser){
    this.httpService.resetPassword(user).subscribe( {
      next: data => {
        this.closeModal();
        this.invokeRefresh();
      }
    })
  }

  //Yells at the admin-dash component to refresh the table data
  invokeRefresh(){
    this._refreshSource.next(true);
  }
}
