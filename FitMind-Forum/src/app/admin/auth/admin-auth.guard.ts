import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AdminAuthService } from './admin-auth.service';

export const adminAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AdminAuthService);
  const router = inject(Router);

  if (authService.isAdminAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/admin/login']);
};
