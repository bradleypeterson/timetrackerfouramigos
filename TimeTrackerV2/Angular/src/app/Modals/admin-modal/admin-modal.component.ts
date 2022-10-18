import {Component, HostListener, OnInit} from '@angular/core';
import {AdminModalService } from '../../services/adminmodal.service';

@Component({
  selector: 'app-admin-modal',
  templateUrl: './admin-modal.component.html',
  styleUrls: ['./admin-modal.component.css']
})
export class AdminModalComponent implements OnInit {

  constructor(
    public modalService: AdminModalService,
  ) { }

  ngOnInit(): void {
  }

  // @HostListener('click') closeModal() {
  //   this.modalService.showModal();
  // }


}
