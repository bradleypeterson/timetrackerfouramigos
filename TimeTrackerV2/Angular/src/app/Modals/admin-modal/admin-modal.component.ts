import {Component, EventEmitter, HostListener, OnInit, Output} from '@angular/core';
import {AdminModalService } from '../../services/adminmodal.service';
import {IUser} from "../../interfaces/IUser";
import { Subscription} from "rxjs";

@Component({
  selector: 'app-admin-modal',
  templateUrl: './admin-modal.component.html',
  styleUrls: ['./admin-modal.component.css']
})
export class AdminModalComponent implements OnInit {

  @Output() refresh = new EventEmitter<boolean>();

  user: IUser = this.modalService.user;

  isHidden: boolean = true;
  enableEditing: boolean = false;

  refreshListener: Subscription | undefined;

  constructor(
    public modalService: AdminModalService,
  ) { }

  ngOnInit(): void {

    this.refreshListener = this.modalService._refresh.subscribe(bool => {
      this.refresh.emit(bool);
    })

  }

  @HostListener('click') closeModal() {
    this.modalService.showModal();
  }

  //If slider is checked then the edit button can be pressed
  enableEdit(event: any){
    this.enableEditing = !this.enableEditing;

    if (!this.enableEditing){
      this.isHidden = true;
    }
  }

  //allows for editing once the edit button has been pressed
  editBtn(){
    if (this.enableEditing) {
      this.isHidden = false;
    }
  }

  //When the save button is pressed, saves the users data to the database
  editSave() {

    let firstName = ((document.getElementById("edit_firstname") as HTMLInputElement).value);
    let lastName = ((document.getElementById("edit_lastname") as HTMLInputElement).value);
    let username = ((document.getElementById("edit_username") as HTMLInputElement).value);
    let email = ((document.getElementById("edit_email") as HTMLInputElement).value);
    let phone = ((document.getElementById("edit_phone") as HTMLInputElement).value);

    let type = ((document.getElementById("accountType") as HTMLInputElement).value);
    let active = ((document.getElementById("activeChoice") as HTMLInputElement).value);


    if (firstName != "") {
      this.user.firstName = firstName;
    }

    if (lastName != "") {
      this.user.lastName = lastName;
    }

    if (username != "") {
      this.user.username = username;
    }

    //Add in email and phone here

    if (type != "") {
      this.user.type = type;
    }

    if (active == 'true') {
      this.user.isActive = true;
    } else if (active == 'false') {
      this.user.isActive = false;
    }

    if (this.isNotAdminCheck()) {
      this.modalService.updateUser(this.user);

    }

  }

  //Fires when the edit menu is shown and the delete button is pressed
  //Deletes the user from the database
  editDelete(){

    if (this.isNotAdminCheck()) {
      this.modalService.deleteUser(this.user);
    }

  }

  //Returns true if the user is not the admin
  isNotAdminCheck(): boolean{
    if (this.user.username === "Admin" && this.user.firstName === "Sudo" && this.user.lastName === "Admin"){
      alert("Cannot modify Admin account!");
      return false;
    }

    return true;
  }


  resetToDefaultPassword(){
    if (this.isNotAdminCheck()){
      this.modalService.setDefaultPassword(this.user);
    }
  }

}
