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

  //List of users and filtered users used to show the users on the main table on the admin dashboard
  users: IUser[] = []
  filtered_users: IUser[] = []

  //Holds admin requests to display the number of requests on the html template
  requests: IAdminRequest[] = [];

  //Changes based on if the user account modal is active or not
  modal: boolean = false;

  //Used to know if the user account modal was opened from the request modal. If so
  //the request modal will reopen when the account modal is closed
  openedFromRequests: boolean = false;

  //A subscription used to open the user information modal if the admin clicks on the account
  //button from the request modal page
  openRequestModal = this.requestService.sharedAccountSource.subscribe((userID: number) => {
    if (userID == -1){
      return;
    }

    let user = this.users.find((user: IUser) => {
      return user.userID == userID;
    })

    this.openedFromRequests = true;
    this.showModal(user as IUser);
  })

// A subscription used to update the table whenever an admin request is saved and changes the table
// eg such as an account upgrade
  updateTable = this.requestService.updateUserTable.subscribe((update) => {
    if (update){
      this.getUsers();
    }
  })

  //A list of usernames to be passed to the modal service to check if a username already
  //exists in the database so an admin cannot change a username of an account to one that already exists
  listOfUsernames: string[] = [];

  constructor(
    private httpService: HttpService,
    private formBuilder: FormBuilder,
    public modalService: AdminModalService,
    public requestService: AdminRequestService,
  ) {}

  //Form for searching for a username or first/last name in the user table on the admin dashboard.
  searchForm = this.formBuilder.group({
    searchTerm: '',
  });

  //The users are called from the database when the component is first loaded
  ngOnInit(): void {
    this.getUsers();
  }

  //Gets users from the database
  getUsers(){
    this.httpService.getUsers().subscribe((_users: any) => {
      this.users = _users;
      this.filtered_users = _users;

      if (this.users.length > 0) {
        this.users.forEach((names) => {
          this.listOfUsernames.push(names.username as string);
        });
      }
    });
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

    this.modalService.create(user, this.listOfUsernames);
    this.modalService.showModal(this.openedFromRequests);
    this.openedFromRequests = false;
  }

  //filters users based on which radio button is selected
  filterUsers(filterType: string) {

    this.filtered_users = this.users.filter((user: IUser) => {

      if (filterType == 'all') {
        return user;
      } else {

        if (user.type?.toLowerCase() == filterType.toLowerCase()) {
          console.log("Returned:");
          console.log(user);
        }

        return user.type?.toLowerCase() == filterType.toLowerCase();
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

