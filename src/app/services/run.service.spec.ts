import { TestBed } from '@angular/core/testing';

import { RunService } from '../services/run.service';

describe('RunService', () => {
  let service: RunService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RunService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
