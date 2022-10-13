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

    this.httpService.getUsers().subscribe((_users: any) => { this.users = _users});

  }

  onSubmit() {

  }

  showModal(){
    this.modal = !this.modal;
  }
}
