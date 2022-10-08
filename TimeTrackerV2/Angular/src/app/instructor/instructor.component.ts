import { Component, OnInit } from '@angular/core';
import { ICourseRequest} from "../interfaces/ICourseRequest";

@Component({
  selector: 'app-instructor',
  templateUrl: './instructor.component.html',
  styleUrls: ['./instructor.component.css']
})
export class InstructorComponent implements OnInit {

  public courseRequests?: ICourseRequest[] = [];
  constructor() { }

  ngOnInit(): void
  {

  }

}
