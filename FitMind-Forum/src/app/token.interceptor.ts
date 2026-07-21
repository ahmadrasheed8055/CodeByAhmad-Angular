// src/app/token.interceptor.ts
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const TokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem('token');
  const router = inject(Router);

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expired or unauthorized
        sessionStorage.clear();
        router.navigate(['']);
      }

       // Server down or unreachable
      if (error.status === 0 || error.status >= 500) {
        sessionStorage.clear();
        router.navigate(['']);
      }
      return throwError(() => error);
    })
  );
};
