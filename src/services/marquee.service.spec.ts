import { TestBed } from '@angular/core/testing';

import { MarqueeService } from './marquee.service';

describe('MarqueeService', () => {
  let service: MarqueeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarqueeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
