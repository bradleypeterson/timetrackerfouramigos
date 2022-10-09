import { Component, OnInit } from '@angular/core';
import { ICourseRequest} from "../interfaces/ICourseRequest";

@Component({
  selector: 'app-instructor',
  templateUrl: './instructor.component.html',
  styleUrls: ['./instructor.component.css']
})
export class InstructorComponent implements OnInit {

  public courseRequests?: ICourseRequest[] = [];
  public isGreen : boolean = false;
  public one : string = "one";
  public two : string = "two";
  constructor() { }

  ngOnInit(): void
  {

  }

}
