/* CodeByAhmad - FitMind Forum Standard Professional Module */

import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, filter, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../Shared/auth.service';
import { AppUser, AppUserPhotos, PublicAppUserDTO } from '../../Model/AppUsers';
import { EmailVarificationComponent } from '../auth/emailVarification/emailVarification.component';
import { LoginComponent } from '../auth/login/login.component';
import { MasterService } from '../../Shared/master.service';
import { SnackBarServiceService } from '../../Shared/snack-bar-service.service';
import { ForgetPasswordComponent } from '../auth/forget-password/forget-password.component';
import { NotificationService } from '../../Shared/notification.service';
import { NotificationItem } from '../../Model/NotificationDTO';
import { SearchResultDTO } from '../../Model/SearchDTO';
import { ChatbotService } from '../../Shared/chatbot.service';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
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
  chatbotService = inject(ChatbotService);
  private platformId = inject(PLATFORM_ID);

  isDarkMode: boolean = false;
  isSidebarCollapsed: boolean = false;
  isSidebarExpanded: boolean = false;
  notifications: NotificationItem[] = [];
  unreadCount: number = 0;
  activeNotifTab: 'all' | 'following' | 'messages' = 'all';

  get filteredNotifications(): NotificationItem[] {
    if (this.activeNotifTab === 'following') {
      return this.notifications.filter(n => n.type === 'follow');
    }
    if (this.activeNotifTab === 'messages') {
      return this.notifications.filter(n => n.type === 'comment' || n.type === 'reaction' || n.type === 'post');
    }
    return this.notifications;
  }

  searchControl = new FormControl('');
  searchResults: SearchResultDTO | null = null;
  showDropdown: boolean = false;
  searchLoading: boolean = false;

  toggleSidebar() {
    this.isSidebarExpanded = !this.isSidebarExpanded;
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleChatbot() {
    this.chatbotService.toggleChat();
  }


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

    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      filter(val => val !== null)
    ).subscribe((query) => {
      if (query && query.trim().length >= 2) {
        this.searchLoading = true;
        this.showDropdown = true;
        this.masterServices.globalSearch(query.trim(), 'all', 1, 3).subscribe({
           next: (res) => {
             this.searchResults = res;
             this.searchLoading = false;
           },
           error: () => {
             // Create an empty SearchResultDTO so the "No results found" message shows
             this.searchResults = { users: { items: [], totalCount: 0 }, posts: { items: [], totalCount: 0 }, categories: { items: [], totalCount: 0 }, polls: { items: [], totalCount: 0 } };
             this.searchLoading = false;
           }
        });
      } else {
        this.searchResults = null;
        this.showDropdown = false;
      }
    });
  }

  showSearchDropdown() {
    if (this.searchControl.value && this.searchControl.value.trim().length >= 2) {
      this.showDropdown = true;
    }
  }

  hideSearchDropdown() {
    setTimeout(() => {
      this.showDropdown = false;
    }, 400);
  }

  onSearchSubmit(event: Event) {
    event.preventDefault();
    const query = this.searchControl.value?.trim();
    if (query && query.length >= 2) {
      this.showDropdown = false;
      this.router.navigate(['/search'], { queryParams: { q: query, type: 'all' } });
    }
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
    this.user = new PublicAppUserDTO();
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

  followBack(event: Event, notif: NotificationItem) {
    event.stopPropagation();
    if (!notif.targetId) return;

    this.masterServices.followUser(notif.targetId).subscribe({
      next: () => {
        notif.isFollowingActor = true;
        this.snackBarService.showSuccess('Followed user successfully');
        // Optionally mark as read
        this.notificationService.markAsRead(notif.id);
        try {
          const bc = new BroadcastChannel('fitmind_community_notifications');
          bc.postMessage({ type: 'FORCE_POLL' });
          bc.close();
        } catch(e) {}
      },
      error: (err) => {
        if (err.status === 400 && (err.error?.message === 'Already following this user.' || err.error === 'Already following this user.')) {
          notif.isFollowingActor = true;
          this.snackBarService.showSuccess('Already following this user.');
        } else {
          this.snackBarService.showError(err.error?.message || err.error || 'Failed to follow back');
        }
      }
    });
  }
}

// decruptUser() {
//   const dUser = sessionStorage.getItem('appUser');
//   if (dUser) {
//     this.user = this.authServices.decryptUser(dUser);
//   //  console.log(this.getProfile());

//   }
// }

