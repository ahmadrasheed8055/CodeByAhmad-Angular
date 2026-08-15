import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { PendingActionService } from './pending-action.service';


export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const pendingActionService = inject(PendingActionService);

  const userId = sessionStorage.getItem('appUserId');
  const token = sessionStorage.getItem('token');

  if (userId && token) {
    return true; // allow access
  } else {
    // Store the intended URL and navigate to home (so navbar with login modal is available)
    // Then open the login modal — after successful login, user will be navigated to the intended URL
    pendingActionService.setDeferredNavigation(state.url);
    router.navigate(['/home']);
    return false; // block access
  }
};
