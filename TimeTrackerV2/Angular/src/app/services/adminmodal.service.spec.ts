import { TestBed } from '@angular/core/testing';

import { AdminModalService } from './adminmodal.service';

describe('AdminmodalService', () => {
  let service: AdminModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
