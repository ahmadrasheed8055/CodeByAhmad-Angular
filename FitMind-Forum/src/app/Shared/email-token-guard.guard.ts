import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { MasterService } from './master.service';

export const emailTokenGuardGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router); // Inject the Router service
  const service = inject(MasterService); // Inject the HttpClient service
  debugger;
  // Extract the token from the query parameters
  const token = route.queryParamMap.get('token');

  if (!token) {
    // If the token is missing, redirect to an error page or login page
    router.navigate(['/error']); // Replace '/error' with your desired route
    return false;
  }
  service.validateEmailToken(token).subscribe((result: any) => {
    if (result.status == 200) {
      console.log("Result : " + result);
    } else {
     router.navigate(['/error']); // Replace '/error' with your desired route
    }
  });


  return true;
};