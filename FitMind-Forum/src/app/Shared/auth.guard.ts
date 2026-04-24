import { CanActivateFn, Router } from '@angular/router';
import { inject, OnInit } from '@angular/core';
import { MasterService } from './master.service';
import { ActivatedRoute } from '@angular/router';
import { routes } from '../app.routes';



export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const httpService = inject(MasterService);

  const userId = sessionStorage.getItem('appUserId');
  const token = sessionStorage.getItem('token');

  if (userId && token) {
    return true; // allow access
  } else {
    router.navigate(['/home']); // redirect to home
    return false; // block access
  }
};