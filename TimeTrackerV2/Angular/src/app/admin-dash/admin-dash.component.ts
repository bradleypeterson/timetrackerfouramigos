import { Component, OnInit } from '@angular/core';
import { HttpService } from '../services/http.service';
import { IUser } from '../interfaces/IUser';
import { FormBuilder } from "@angular/forms";
import { AdminModalService } from "../services/adminmodal.service";
import { AdminRequestService} from "../services/adminrequest.service";
import { IAdminRequest} from "../interfaces/IAdminRequest";

@Component({
  selector: 'app-admin-dash',
  templateUrl: './admin-dash.component.html',
  styleUrls: ['./admin-dash.component.css']
})

export class AdminDashComponent implements OnInit {

  users: IUser[] = []
  filtered_users: IUser[] = []

  requests: IAdminRequest[] = [];

  modal: boolean = false;


  constructor(
    private httpService: HttpService,
    private formBuilder: FormBuilder,
    public modalService: AdminModalService,
    public requestService: AdminRequestService,
  ) {
  }

  searchForm = this.formBuilder.group({
    searchTerm: '',
  });

  ngOnInit(): void {

    this.getUsers();
    this.getRequests();

  }

  //Gets users from the database
  getUsers(){
    this.httpService.getUsers().subscribe((_users: any) => {
      this.users = _users;
      this.filtered_users = _users;
    });
  }

  getRequests() {

  }

  //Fires when the search button is clicked
  //Searches the table for any user that matches the search data
  //Uses regex to remove any special characters
  // Allowed: Aa-Zz, 0-9, and space " "
  onSubmit() {
    let searchWord = this.searchForm.value['searchTerm'];

    let regex = new RegExp('^[a-zA-Z0-9 _]*$');
    let test = regex.test(searchWord);

    if (test){
      if (searchWord == "" || searchWord == null){
        this.searchByTerm("");
      } else  {
        this.searchByTerm(searchWord.trim());
      }
    } else {
      alert("Invalid search input! Letters, numbers, and spaces only!");
    }

    this.searchForm.reset();
  }

  //Opens the modal and passes in the selected user
  showModal(user: IUser) {

    this.modalService.create(user);
    this.modalService.showModal();
  }

  //filters users based on which radio button is selected
  filterUsers(filterType: string) {

    this.filtered_users = this.users.filter((user: IUser) => {

      if (filterType == 'all') {
        return user;
      } else {
        return user.type == filterType;
      }

    })
  }

  //Fired when the user uses the search bar to find a specific user or set of users
  searchByTerm(name: string){

    //Returns all users if the search bar is blank
    if(name == "" || name == null){
      this.filtered_users = this.users;
      return;
    }

    //Returns the users that match the search criteria
    this.filtered_users = this.users.filter((user: IUser) => {
      // @ts-ignore
      if ((user.firstName.toLowerCase() as string) == name || (user.lastName.toLowerCase() as string) == name || (user.username.toLowerCase() as string) == name){
        return user;
      } else {
        return null;
      }
    });

  }


}

