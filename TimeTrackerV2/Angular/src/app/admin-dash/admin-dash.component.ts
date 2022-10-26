import { Component, OnInit } from '@angular/core';
import { HttpService } from '../services/http.service';
import { IUser } from '../interfaces/IUser';
import { FormBuilder } from "@angular/forms";
import { AdminModalService } from "../services/adminmodal.service";

@Component({
  selector: 'app-admin-dash',
  templateUrl: './admin-dash.component.html',
  styleUrls: ['./admin-dash.component.css']
})

export class AdminDashComponent implements OnInit {

  users: IUser[] = []
  filtered_users: IUser[] = []
  modal: boolean = false;


  constructor(
    private httpService: HttpService,
    private formBuilder: FormBuilder,
    public modalService: AdminModalService,
  ) {
  }

  searchForm = this.formBuilder.group({
    searchTerm: '',
  });

  ngOnInit(): void {

    this.getUsers();


  }

  getUsers(){
    this.httpService.getUsers().subscribe((_users: any) => {
      this.users = _users;
      this.filtered_users = _users;
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

    if (searchWord == "" || searchWord == null){
      this.searchByName("");
    } else if (regex) {
      this.searchByName(searchWord.trim());
    }



    this.searchForm.reset();
  }

  showModal(user: IUser) {

    this.modalService.create(user);
    this.modalService.showModal();
  }

  filterUsers(filterType: string) {

    this.filtered_users = this.users.filter((user: IUser) => {

      if (filterType == 'all') {
        return user;
      } else {
        return user.type == filterType;
      }

    })
  }

  searchByName(name: string){

    if(name == "" || name == null){
      this.filtered_users = this.users;
      return;
    }

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

