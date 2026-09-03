import { Injectable, inject, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

// ========== Pending Action Type Definitions ==========
export type PendingAction =
  | { type: 'LIKE_POST'; postId: number; isLike: boolean }
  | { type: 'SAVE_POST'; postId: number }
  | { type: 'HIDE_POST'; postId: number }
  | { type: 'FOLLOW_USER'; targetUserId: number }
  | { type: 'SUBMIT_COMMENT'; postId: number; text: string }
  | { type: 'REPLY_COMMENT'; postId: number; parentCommentId: number; text: string }
  | { type: 'REACT_COMMENT'; commentId: number; isLike: boolean }
  | { type: 'VOTE_POLL'; pollId: number; optionId: number }
  | { type: 'ADD_POLL_OPTION'; pollId: number; optionText: string }
  | { type: 'NAVIGATE'; targetUrl: string };

@Injectable({
  providedIn: 'root',
})
export class PendingActionService {
  private pendingAction: PendingAction | null = null;
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);
  private authService = inject(AuthService);
  private router = inject(Router);
  private modalDismissListenerSet = false;

  // Emits { action, userId } when login succeeds and there's a pending action to replay
  actionReady$ = new Subject<{ action: PendingAction; userId: number }>();

  private isPaused = false;
  private queuedReplay: { action: PendingAction; userId: number } | null = null;

  constructor() {
    // Listen for successful login to replay pending actions
    this.authService.loginSuccess$.subscribe((userId: number) => {
      if (this.pendingAction) {
        const action = this.pendingAction;

        // Handle navigation actions directly (from route guard)
        if (action.type === 'NAVIGATE') {
          this.clearPendingAction();
          this.router.navigate([action.targetUrl]);
          return;
        }

        if (this.isPaused) {
          this.queuedReplay = { action, userId };
        } else {
          // Emit for component subscribers to handle
          this.actionReady$.next({ action, userId });
        }
        this.clearPendingAction();
      }
    });
  }

  // ========== Orchestration API ==========

  /**
   * Pause the replay of pending actions.
   * Useful when components are performing heavy data fetches (like getAllPosts) upon login.
   */
  pauseReplay(): void {
    this.isPaused = true;
  }

  /**
   * Resume the replay of pending actions.
   * Any action that succeeded during the pause will now be emitted.
   */
  resumeReplay(): void {
    this.isPaused = false;
    if (this.queuedReplay) {
      this.actionReady$.next(this.queuedReplay);
      this.queuedReplay = null;
    }
  }

  // ========== Public API ==========

  /**
   * Store a pending action and open the login modal.
   * Only one action is stored at a time (last action wins).
   */
  setPendingAction(action: PendingAction): void {
    this.pendingAction = action;
    this.openLoginModal();
  }

  /**
   * Store a deferred navigation (from route guard).
   * Opens the login modal after a short delay to ensure DOM readiness.
   */
  setDeferredNavigation(targetUrl: string): void {
    this.pendingAction = { type: 'NAVIGATE', targetUrl };
    if (isPlatformBrowser(this.platformId)) {
      // Immediate execution
      requestAnimationFrame(() => this.openLoginModal());
    }
  }

  hasPendingAction(): boolean {
    return this.pendingAction !== null;
  }

  getPendingAction(): PendingAction | null {
    return this.pendingAction;
  }

  clearPendingAction(): void {
    this.pendingAction = null;
  }

  // ========== Private Helpers ==========

  /**
   * Programmatically opens the Bootstrap 5 login modal using the JS API immediately outside Angular zone.
   */
  private openLoginModal(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.ensureModalDismissListener();

    this.ngZone.runOutsideAngular(() => {
      const modalEl = document.getElementById('loginModal');
      if (modalEl) {
        const bs = (window as any).bootstrap;
        if (bs?.Modal) {
          const modal = bs.Modal.getOrCreateInstance(modalEl, {
            backdrop: true,
            keyboard: true,
            focus: true
          });
          modal.show();
        } else {
          const trigger = document.querySelector('[data-bs-target="#loginModal"]') as HTMLElement;
          if (trigger) {
            trigger.click();
          }
        }
      }
    });
  }

  /**
   * Sets up a one-time listener for the Bootstrap modal 'hidden.bs.modal' event.
   * If the user dismisses the modal without logging in, the pending action is cleared.
   */
  private ensureModalDismissListener(): void {
    if (this.modalDismissListenerSet) return;

    this.ngZone.runOutsideAngular(() => {
      const modalEl = document.getElementById('loginModal');
      if (modalEl) {
        modalEl.addEventListener('hidden.bs.modal', () => {
          // Only clear if user dismissed without logging in
          if (!this.authService.isLoggedIn()) {
            this.ngZone.run(() => {
              this.clearPendingAction();
            });
          }
        });
        this.modalDismissListenerSet = true;
      }
    });
  }
}
