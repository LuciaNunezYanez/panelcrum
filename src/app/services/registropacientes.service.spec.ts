import { TestBed } from '@angular/core/testing';

import { RegistropacientesService } from './registropacientes.service';

describe('RegistropacientesService', () => {
  let service: RegistropacientesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegistropacientesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
