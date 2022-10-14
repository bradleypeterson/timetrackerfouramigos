import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Router} from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { HttpService } from '../services/http.service';
import { ICourse } from '../interfaces/ICourse';
import {IUser} from "../interfaces/IUser";
import {IGroup} from "../interfaces/IGroup";
import { NULL_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit {
  public pageTitle = 'TimeTrackerV2 | Project'
  public errMsg = '';
  private item;
  public projectName;
  public projectDescription;
  public userTypeHolder: IUser;
  public groups: IGroup[] = [];
  
  public user: any = JSON.parse(localStorage.getItem('currentUser') as string);

  // reveals the create group form
  public bvis = false;

  //Allow course creation if the user is an Instructor
  public isInstructor: boolean = false;

  constructor(
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private router: Router,
    private httpService: HttpService,

    
  ) {
    this.item = localStorage.getItem('currentProject');
    console.log("The current project is: " + this.item);
    if(this.item) {
      this.item = JSON.parse(this.item);
      this.projectName = this.item[0];
      this.projectDescription = this.item[3];
    }

    this.userTypeHolder = new class implements IUser
    {
      firstName?: string;
      id?: number;
      isActive?: boolean;
      lastName?: string;
      password?: string;
      salt?: string;
      type?: string;
      username?: string;
    }
  }

  

  //Forms for creating a new group
  groupForm = this.formBuilder.group({
    groupName: '',
  });

  ngOnInit(): void {
    this.getGroups();


    let payload = {
      username: this.user.username,
    }
    //Gets user from database
    this.httpService.getUser(payload).subscribe((_user: any) =>
    {
      this.userTypeHolder = _user
      //Allow user to create courses if they are an instructor
      if(this.userTypeHolder.type == "Instructor")
      {
        this.isInstructor = true;
      }
      else
      {
        this.isInstructor = false;
      }
    });
  }

  getGroups() {
    this.httpService.getGroups(1).subscribe((_groups: any) => { this.groups = _groups });
  }

  // changes the value of bvis to show the hidden form
  revealForm(): void {
    if (this.bvis == true) {
      this.bvis = false;
      this.groupForm.reset(); //Clears the form data
    }
    else {
      this.bvis = true;
    }
  }

  // hide form when clicking cancel?
  hideForm(): void {
    this.bvis = false; // set to false
    this.groupForm.reset(); //Clears the form data
    //location.reload(); // refresh the page
  }

  createGroup(): void {
// need to get the current project...

// gets the values from the form,
    // the instructor ID is the current user ID,
    // is active is automatically set to true
    let payload = {
      groupName: this.groupForm.value['groupName'],
      isActive: true,
      projectID: 1, // PLACEHOLDER...
    }

    /*let payload = {
      groupName: 'New Group',
      isActive: true,
    }
    console.log(payload);*/

    this.httpService.createGroup(payload).subscribe({
      next: data => {
        this.errMsg = "";
        //this.router.navigate(['./']);
        //location.reload(); // refresh the page
        this.groupForm.reset(); //Clears the form data after submitting the data.
        this.bvis = false; // hide the form again
        this.getGroups();
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }
}
