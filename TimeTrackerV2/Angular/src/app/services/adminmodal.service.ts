import { Injectable } from '@angular/core';
import {IUser} from "../interfaces/IUser";

@Injectable({
  providedIn: 'root'
})
export class AdminModalService {

  public modalDisplay: boolean = false;
  public user: any;

  constructor() { }

  showModal(){
    this.modalDisplay = !this.modalDisplay;
  }

  create(user: IUser){
    this.user = user;
  }
}
