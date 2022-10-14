import { TestBed } from '@angular/core/testing';

import { ClouDataService } from './clou-data.service';

describe('ClouDataService', () => {
  let service: ClouDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClouDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
