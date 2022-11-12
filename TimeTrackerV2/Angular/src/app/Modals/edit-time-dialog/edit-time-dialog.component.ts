import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-edit-time-dialog',
  templateUrl: './edit-time-dialog.component.html',
  styleUrls: ['./edit-time-dialog.component.css']
})
export class EditTimeDialogComponent implements OnInit {

  public timeIn: any;
  public timeOut: any;
  public description: any;
  public error = false;
  constructor(@Inject(MAT_DIALOG_DATA) public date: any, private dialog: MatDialogRef<any>)
  {
    this.timeIn = date.timeIn;
    this.timeOut = date.timeOut;
    this.description = date.description;
  }

  ngOnInit(): void {
  }
  returnDate(): void
  {
    this.error = false;
    //Entered date range is negative
    if((new Date(this.timeOut).getTime() - new Date(this.timeIn).getTime()) < 0)
    {
      this.error = true;
    }
    else
    {
      let payload = {
        timeIn: this.timeIn,
        timeOut: this.timeOut,
        description: this.description
      }
      this.dialog.close(payload);
    }

  }

}
