import { TestBed } from '@angular/core/testing';

import { ConcernService } from './concern.service';

describe('ConcernService', () => {
  let service: ConcernService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConcernService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
