import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminAuthService } from '../../auth/admin-auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.css'
})
export class AdminShellComponent implements OnInit {
  private authService = inject(AdminAuthService);
  private router = inject(Router);

  isSidebarExpanded = true;
  isDarkMode = true;
  adminEmail = 'Admin';
  adminDisplayName = 'Store Administrator';
  currentRouteTitle = 'Dashboard';

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.adminEmail = payload.email || 'admin@fitmind.com';
        this.adminDisplayName = payload.name || payload.email?.split('@')[0] || 'Administrator';
      } catch (e) {}
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
    }

    this.updateRouteTitle(this.router.url);
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.updateRouteTitle(e.urlAfterRedirects || e.url);
    });
  }

  toggleSidebar(): void {
    this.isSidebarExpanded = !this.isSidebarExpanded;
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    const theme = this.isDarkMode ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-bs-theme', theme);
  }

  private updateRouteTitle(url: string): void {
    if (url.includes('/admin/users')) this.currentRouteTitle = 'App Users Management';
    else if (url.includes('/admin/posts')) this.currentRouteTitle = 'Posts & Moderation';
    else if (url.includes('/admin/reports')) this.currentRouteTitle = 'Reports & Flag Queue';
    else if (url.includes('/admin/categories')) this.currentRouteTitle = 'Categories Manager';
    else if (url.includes('/admin/polls')) this.currentRouteTitle = 'Polls & Surveys';
    else if (url.includes('/admin/admins')) this.currentRouteTitle = 'Admin Access Control';
    else this.currentRouteTitle = 'Dashboard Overview';
  }

  logout(): void {
    this.authService.logout();
  }
}
