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
    private httpService:HttpService,
    private formBuilder: FormBuilder,
    public modalService: AdminModalService,
  )
  { }

  searchForm = this.formBuilder.group({
    searchTerm: '',
  });

  ngOnInit(): void {

    this.httpService.getUsers().subscribe((_users: any) => { this.users = _users; this.filtered_users = this.users;});


  }

  onSubmit() {

  }

  showModal(user: IUser){
    this.modalService.create(user);
    this.modalService.showModal();
  }

  filterUsers(filterType: string){


    this.filtered_users = this.users.filter((user: IUser) => {

      if (filterType == 'all'){
        return user;
      } else {
        return user.type == filterType;
      }

    })
  }



}
