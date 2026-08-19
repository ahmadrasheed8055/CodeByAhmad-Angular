// src/app/token.interceptor.ts
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const TokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem('token');
  const router = inject(Router);

  const isAdminRoute = req.url.includes('/api/admin');
  const isChatbotRoute = req.url.includes('/api/Chatbot');

  // Only attach the regular app token if it's not an admin route
  if (token && !isAdminRoute) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Don't intercept or redirect for admin routes
      if (isAdminRoute) {
        return throwError(() => error);
      }

      // Handle 401 Unauthorized for authenticated endpoints
      if (error.status === 401 && !isChatbotRoute) {
        // Only clear session if token was actually provided or request required auth
        if (token) {
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('appUserId');
          sessionStorage.removeItem('cached_app_user');
          sessionStorage.removeItem('cached_profile_photo');
          sessionStorage.removeItem('cached_bg_photo');
          sessionStorage.removeItem('username');
          
          // Only redirect if user is currently on an auth-protected route
          const protectedRoutes = ['/profile-setting', '/profile-view', '/add-post', '/user-posts'];
          const currentUrl = router.url;
          if (protectedRoutes.some(route => currentUrl.startsWith(route))) {
            router.navigate(['/home']);
          }
        }
      }

      // Pass error through to calling components/services for local graceful handling (toasts, inline badges)
      // Do NOT navigate to /error on 500 or 0 to avoid breaking user flows and chatbot
      return throwError(() => error);
    })
  );
};
