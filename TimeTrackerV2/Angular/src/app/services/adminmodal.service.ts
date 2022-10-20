import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdminModalService {

  public modalDisplay: boolean = false;

  constructor() { }

  showModal(){
    this.modalDisplay = !this.modalDisplay;
  }
}
