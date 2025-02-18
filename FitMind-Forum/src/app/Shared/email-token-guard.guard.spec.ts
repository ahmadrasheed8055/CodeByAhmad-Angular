import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { emailTokenGuardGuard } from './email-token-guard.guard';

describe('emailTokenGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => emailTokenGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
