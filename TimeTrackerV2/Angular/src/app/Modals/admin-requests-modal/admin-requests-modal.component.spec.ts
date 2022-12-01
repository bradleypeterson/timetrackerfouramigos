import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRequestsModalComponent } from './admin-requests-modal.component';

describe('AdminRequestsModalComponent', () => {
  let component: AdminRequestsModalComponent;
  let fixture: ComponentFixture<AdminRequestsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminRequestsModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminRequestsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
