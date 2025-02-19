import {
  CanActivateFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { MasterService } from './master.service';
import { response } from 'express';

export const emailTokenGuardGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router); // Inject the Router service
  const service = inject(MasterService); // Inject the HttpClient service

  let message: string = '';

  // debugger;
  // Extract the token from the query parameters
  const token = route.queryParamMap.get('token');

  if (!token) {
    // If the token is missing, redirect to an error page or login page
    router.navigate(['/error'], { queryParams: { status: 400 } });
    return of(false);
  }

  // updated code
  return service.validateEmailToken(token).pipe(
    map((response: any) => {
      // debugger;

      console.log(response);
      message = response.message;
      // router.navigate(['/home'], { queryParams: { status: 1 } });
      return true;
    }),
    catchError((error: any) => {
      // debugger;
      console.log(error);
      if (error.status == 404) {
        router.navigate(['/error'], { queryParams: { status: 404 } });
        return of(false);
      } else if (error.status == 500) {
        router.navigate(['/error'], { queryParams: { status: 500 } });
        return of(false);
      } else if (error.status == 400) {
        router.navigate(['/error'], { queryParams: { status: 400 } });
        return of(false);
      } else {
        router.navigate(['/error'], {
          queryParams: { message: error.error.message },
        });
        return of(false);
      }
    })
  );
};

// service.validateEmailToken(token).subscribe({

//   next: (response: any) => {

//     console.log(response);
//     message = response.message;
//     router.navigate(['/register'], { queryParams: { status: 1 } });
//     return true;
//   },

//   error: (error: any) => {
//     console.log(error);
//     if (error.status == 404) {

//       router.navigate(['/error'], { queryParams: { status: 404 } });
//       return false;

//     } else if (error.status == 500) {

//       router.navigate(['/error'], { queryParams: { status: 500 } });
//       return false;

//     }else if(error.status == 400){

//       router.navigate(['/error'], { queryParams: { status: 400 } });
//       return false;
//     }

//     else {

//       router.navigate(['/error'], { queryParams: { message : error.error.message } });
//       return false;

//     }
//   }

// if (result.status == 200) {
//   message = result.message;
//   router.navigate(['/register']);
//   return true;
// } else {
//   message = result.error.message;
//   router.navigate(['/error']);
//   return false;
// }
