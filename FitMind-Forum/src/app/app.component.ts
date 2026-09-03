import { Component, HostListener, Inject, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { ChatbotWidgetComponent } from './website/chatbot-widget/chatbot-widget.component';
import { LoginComponent } from './website/auth/login/login.component';
import { EmailVarificationComponent } from './website/auth/emailVarification/emailVarification.component';
import { ForgetPasswordComponent } from './website/auth/forget-password/forget-password.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    ChatbotWidgetComponent,
    LoginComponent,
    EmailVarificationComponent,
    ForgetPasswordComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'FitMind-Forum';
  private router = inject(Router);

  showScrollTop = false;
  isNavigating = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.isNavigating = true;
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.isNavigating = false;
      }
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      this.showScrollTop = window.scrollY > 300;
    }
  }

  scrollToTop() {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
