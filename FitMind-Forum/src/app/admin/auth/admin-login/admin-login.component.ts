import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AdminAuthService } from '../admin-auth.service';

declare const google: any;

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent implements OnInit, AfterViewInit {
  @ViewChild('googleBtnContainer', { static: false }) googleBtnContainer!: ElementRef;

  errorMessage: string | null = null;
  isLoading = false;
  private readonly googleClientId = '258112102687-v0tu36ul8686e791ghtvg3rqljars5p1.apps.googleusercontent.com';

  constructor(
    private adminAuthService: AdminAuthService,
    private router: Router,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId) && this.adminAuthService.isAdminAuthenticated()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initGoogleAuth();
    }
  }

  private initGoogleAuth(): void {
    const checkGoogle = setInterval(() => {
      if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        clearInterval(checkGoogle);
        try {
          google.accounts.id.initialize({
            client_id: this.googleClientId,
            callback: (response: any) => this.handleGoogleCredentialResponse(response.credential),
            auto_select: false,
            cancel_on_tap_outside: true
          });

          if (this.googleBtnContainer?.nativeElement) {
            google.accounts.id.renderButton(
              this.googleBtnContainer.nativeElement,
              {
                type: 'standard',
                theme: 'outline',
                size: 'large',
                text: 'signin_with',
                shape: 'rectangular',
                logo_alignment: 'left',
                width: 320
              }
            );
          }
        } catch (err) {
          console.error('Error initializing Google GSI:', err);
        }
      }
    }, 100);

    setTimeout(() => clearInterval(checkGoogle), 10000);
  }

  triggerGoogleLogin(): void {
    if (isPlatformBrowser(this.platformId) && typeof google !== 'undefined' && google.accounts?.id) {
      google.accounts.id.prompt();
    }
  }

  handleGoogleCredentialResponse(idToken: string): void {
    if (!idToken) return;

    this.ngZone.run(() => {
      this.isLoading = true;
      this.errorMessage = null;

      this.adminAuthService.googleLogin(idToken).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/admin/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          if (err.status === 401 || err.status === 403) {
            this.errorMessage = err.error?.message || err.error || 'Access Denied: Your email is not whitelisted for Admin access.';
          } else if (err.status === 0) {
            this.errorMessage = 'Cannot connect to backend server. Please ensure FitMind-API is running.';
          } else {
            this.errorMessage = err.error?.message || err.error || 'An error occurred during sign-in. Please try again.';
          }
        }
      });
    });
  }
}
