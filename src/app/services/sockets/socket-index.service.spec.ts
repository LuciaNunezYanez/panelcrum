import { TestBed } from '@angular/core/testing';

import { SocketIndexService } from './socket-index.service';

describe('SocketIndexService', () => {
  let service: SocketIndexService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SocketIndexService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
