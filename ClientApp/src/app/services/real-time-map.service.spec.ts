import { TestBed } from '@angular/core/testing';

import { RealTimeMapService } from './real-time-map.service';

describe('RealTimeMapService', () => {
  let service: RealTimeMapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RealTimeMapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
