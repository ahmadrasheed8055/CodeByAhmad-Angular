import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const employeeData = localStorage.getItem('User');
  const router = inject(Router);
  if (!employeeData) {
    router.navigateByUrl('login');
    return false;
  }
  return true;
};
