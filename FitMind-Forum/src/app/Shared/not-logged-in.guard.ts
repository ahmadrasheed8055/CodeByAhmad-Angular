import { CanActivateFn, Router } from '@angular/router';
import { routes } from '../app.routes';
import { inject } from '@angular/core';

export const notLoggedInGuard: CanActivateFn = (route, state) => {
 const user = sessionStorage.getItem('appUserId');
 var router = inject(Router);

 if (user) {
  router.navigate(['/home']);
   return false;
 }
 return true;
};
