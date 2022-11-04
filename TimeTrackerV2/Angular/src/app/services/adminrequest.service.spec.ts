import { TestBed } from '@angular/core/testing';

import { AdminrequestService } from './adminrequest.service';

describe('AdminrequestService', () => {
  let service: AdminrequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminrequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
