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

  //Used by the admin dash to call a refresh to the users table
  @Output() refresh = new EventEmitter<boolean>();

  //Listens to the modal service for reasons to update the main user table
  refreshListener: Subscription | undefined;

  //Current user displayed in the modal
  user: IUser = this.modalService.user;

  //Hides text inputs that appear when the edit button is clicked
  isHidden: boolean = true;

  //Is true when the enable edit switch is flipped
  enableEditing: boolean = false;

  //Holds a list of courses that the current user is enrolled in to display on the user info modal
  courses: any[] = [];
  //Subscription that pulls the users courses from the modal service.
  courseInfo = this.modalService._courseSource.subscribe((item) => {

    item.forEach((obj) => {
      this.courses.push(obj);
    });

  });

  //Holds a list of projects the user is enrolled in to display on the user info modal
  projects: any[] = [];

  //Subscription that pulls the users projects from the modal service.
  projectInfo = this.modalService._projectSource.subscribe((item) =>{

      item.forEach((obj) => {
        this.projects.push(obj);
      });
  })

  //Holds a list of groups the user is enrolled in to display on the user info modal
  groups: any[] = [];

  //Subscription that pulls the users groups from the modal service.
  groupInfo = this.modalService._groupSource.subscribe((item) =>{

    item.forEach((obj) => {
      this.groups.push(obj);
    });
  })

  constructor(
    public modalService: AdminModalService,
  ) { }


  ngOnInit(): void {

    this.refreshListener = this.modalService._refresh.subscribe(bool => {
      this.refresh.emit(bool);
    })
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
  //Checks which fields were updated and updates them accordingly.
  //Currently email and phone number are not implemented in the database.
  editSave() {

    let tempUser = this.user;

    let firstName = ((document.getElementById("edit_firstname") as HTMLInputElement).value);
    let lastName = ((document.getElementById("edit_lastname") as HTMLInputElement).value);
    let username = ((document.getElementById("edit_username") as HTMLInputElement).value);
    let email = ((document.getElementById("edit_email") as HTMLInputElement).value);
    let phone = ((document.getElementById("edit_phone") as HTMLInputElement).value);

    let type = ((document.getElementById("accountType") as HTMLInputElement).value);
    let active = ((document.getElementById("activeChoice") as HTMLInputElement).value);


    if (firstName != "") {
      tempUser.firstName = firstName;
    }

    if (lastName != "") {
      tempUser.lastName = lastName;
    }

    if (username != "") {
      tempUser.username = username;
    }

    //Add in email and phone here

    if (type != "") {
      tempUser.type = type;
    }

    if (active == 'true') {
      tempUser.isActive = true;
    } else if (active == 'false') {
      tempUser.isActive = false;
    }

    if (this.isNotAdminCheck()) {
      this.modalService.updateUser(tempUser);
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

 //Calls the modal service to reset the selected users account to have the default password.
  resetToDefaultPassword(){
    if (this.isNotAdminCheck()){
      this.modalService.setDefaultPassword(this.user);
    }
  }

}
