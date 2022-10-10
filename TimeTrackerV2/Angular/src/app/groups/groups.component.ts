import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../services/http.service';
import {IGroup} from "../interfaces/IGroup";
import {IProject} from "../interfaces/IProject";

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent implements OnInit {

  groups: IGroup[] = [];
  private project: IProject = history.state.data;

  constructor(
    private httpService:HttpService,
    private router: Router,
    ) {}

  ngOnInit(): void {

    this.getGroups(this.project['projectID'] as number);

  }

  getGroups(id: number){
    this.httpService.getGroups(id).subscribe((_groups: any) => { this.groups = _groups; });
  }

}
