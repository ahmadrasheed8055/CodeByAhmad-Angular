/* CodeByAhmad - FitMind Forum Standard Professional Module */

import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../Shared/auth.service';
import { AppUser, AppUserPhotos, PublicAppUserDTO } from '../../Model/AppUsers';
import { EmailVarificationComponent } from '../auth/emailVarification/emailVarification.component';
import { LoginComponent } from '../auth/login/login.component';
import { MasterService } from '../../Shared/master.service';
import { SnackBarServiceService } from '../../Shared/snack-bar-service.service';
import { ForgetPasswordComponent } from '../auth/forget-password/forget-password.component';
import { NotificationService } from '../../Shared/notification.service';
import { NotificationItem } from '../../Model/NotificationDTO';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    RouterModule,
    EmailVarificationComponent,
    LoginComponent,
    ForgetPasswordComponent
  ],

  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  loginModal: string = '#loginModal';
  deleteProfileModal = '#deleteProfileModal';
  registerModal: string = '#registerModal';
  emailVarificationModal: string = '#emailVarificationModal';
  user!: PublicAppUserDTO;
  userPhotos!: AppUserPhotos;
  authServices = inject(AuthService);
  router = inject(Router);
  masterServices = inject(MasterService);
  snackBarService = inject(SnackBarServiceService);
  notificationService = inject(NotificationService);
  private platformId = inject(PLATFORM_ID);

  isDarkMode: boolean = false;
  notifications: NotificationItem[] = [];
  unreadCount: number = 0;

  ngOnInit() {
    this.notificationService.notifications$.subscribe((items) => {
      this.notifications = items;
    });

    this.notificationService.unreadCount$.subscribe((count) => {
      this.unreadCount = count;
    });

    if (isPlatformBrowser(this.platformId)) {
      this.initTheme();
    }

    this.authServices.appUserData$.subscribe((user) => {
      if (user) {
        this.user = { ...user };
      }
    });
    this.authServices.appUserPhotos$.subscribe((photos) => {
      if (!photos) return;
      this.userPhotos = photos;
    });
  }

  initTheme() {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      this.isDarkMode = storedTheme === 'dark';
    } else {
      this.isDarkMode = !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    this.applyTheme(this.isDarkMode ? 'dark' : 'light');
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    const theme = this.isDarkMode ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
  }

  applyTheme(theme: string) {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('data-bs-theme', theme);
    }
  }

  constructor() {
    this.user = new AppUser();
  }

  logout() {
    sessionStorage.removeItem('appUserId');
    sessionStorage.clear();
    this.snackBarService.showSuccess('Logout successfully!');
    this.router.navigate(['/']);
  }

  markNotificationAsRead(id: string) {
    this.notificationService.markAsRead(id);
  }

  markAllNotificationsAsRead() {
    this.notificationService.markAllAsRead();
  }

  onNotificationClick(notif: NotificationItem) {
    this.notificationService.markAsRead(notif.id);
    if (notif.targetId) {
      this.router.navigate(['/profile-view'], { queryParams: { postId: notif.targetId } });
    } else {
      this.router.navigate(['/profile-view']);
    }
  }

  deleteNotification(event: Event, id: string) {
    event.stopPropagation(); // prevent clicking the dropdown item
    this.notificationService.deleteNotification(id);
  }
}

// decruptUser() {
//   const dUser = sessionStorage.getItem('appUser');
//   if (dUser) {
//     this.user = this.authServices.decryptUser(dUser);
//   //  console.log(this.getProfile());

//   }
// }
