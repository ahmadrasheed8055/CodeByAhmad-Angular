import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgxLoaderService } from './Shared/ngx-loader.service';
import { finalize } from 'rxjs/operators';

let activeRequests = 0;

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  // List of endpoints that should NOT trigger the full-screen loading spinner
  const silentUrls = [
    'check-unique-name',
    'PostReactions',
    'comments',
    'reactions',
    'react',
    'removeReaction',
    'vote',
    'poll',
    'Poll',
    'Vote',
    'savePost',
    'Search',
    'Chatbot'
  ];

  const isSilent = silentUrls.some(url => req.url.includes(url)) || req.headers.has('x-skip-loader');

  if (isBrowser && !isSilent) {
    const loaderService = inject(NgxLoaderService);

    // Increment active requests and start loading
    activeRequests++;
    loaderService.startLoading();

    return next(req).pipe(
      finalize(() => {
        activeRequests--;
        if (activeRequests <= 0) {
          activeRequests = 0;
          loaderService.stopLoading();
        }
      })
    );
  }

  return next(req);
};
