import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
  selector: 'app-edit-time-dialog',
  templateUrl: './edit-time-dialog.component.html',
  styleUrls: ['./edit-time-dialog.component.css']
})
export class EditTimeDialogComponent implements OnInit {

  public test = "hello"
  constructor(@Inject(MAT_DIALOG_DATA) public date: any) { }

  ngOnInit(): void {
  }

}
