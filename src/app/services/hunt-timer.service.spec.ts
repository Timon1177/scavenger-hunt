import { TestBed } from '@angular/core/testing';

import { HuntTimerService } from './hunt-timer.service';

describe('HuntTimerService', () => {
  let service: HuntTimerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HuntTimerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
