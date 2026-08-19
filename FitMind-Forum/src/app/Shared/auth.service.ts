import { inject, Injectable } from '@angular/core';
import {
  AppUser,
  AppUserPhotos,
  IAppUser,
  PublicAppUserDTO,
} from '../Model/AppUsers';
import * as CryptoJs from 'crypto-js';
import { MasterService } from './master.service';
import { BehaviorSubject, Subject, take } from 'rxjs';
import { Router } from '@angular/router';
import { GetUserPostsDTO } from '../Model/GetUserPosts';
import { SnackBarServiceService } from './snack-bar-service.service';
const SECURE_KEY = 'FITMIND8055';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  router = inject(Router);

  //==========APP USER OBJECT =====================
  private appUser = new BehaviorSubject<PublicAppUserDTO | null>(null);
  appUserData$ = this.appUser.asObservable();

  //==========APP Posts OBJECT =====================
  private appPosts = new BehaviorSubject<GetUserPostsDTO[] | null>(null);
  appPostsData$ = this.appPosts.asObservable();

  //==========APP USER PHOTOS OBJECT =====================
  private appUserPhotos = new BehaviorSubject<AppUserPhotos | null>(null);
  appUserPhotos$ = this.appUserPhotos.asObservable();

  //==========APP USER Id OBJECT =====================
  private appUserId = new BehaviorSubject<number | null>(null);
  appUserId$ = this.appUserId.asObservable();

  //==========LOGIN SUCCESS SIGNAL =====================
  // Emits userId after a full login sequence completes (session set + user data fetched)
  loginSuccess$ = new Subject<number>();

  masterServices = inject(MasterService);

  constructor() {
    const userId = sessionStorage.getItem('appUserId');
    if (userId) {
      this.setAppUserId(Number(userId));
      
      // Load cached user object immediately for instant UI
      const cachedUser = sessionStorage.getItem('cached_app_user');
      if (cachedUser) {
        try {
          this.appUser.next(JSON.parse(cachedUser));
        } catch (_) {}
      }

      // Load cached profile photo immediately for 0ms avatar rendering
      const cachedPhoto = sessionStorage.getItem('cached_profile_photo');
      const cachedBg = sessionStorage.getItem('cached_bg_photo');
      if (cachedPhoto || cachedBg) {
        const initialPhotos = new AppUserPhotos();
        if (cachedPhoto) initialPhotos.profilePhoto = cachedPhoto;
        if (cachedBg) initialPhotos.backgroundPhoto = cachedBg;
        this.appUserPhotos.next(initialPhotos);
      }
    }
    this.setAppUser();
  }

  //==========Setting app user Id =====================
  setAppUserId(userId: number): void {
    this.appUserId.next(userId);
    sessionStorage.setItem('appUserId', userId.toString());
  }

  //==========Setting app user =====================
  setAppUser(): void {
    if (!this.isLoggedIn()) {
      return;
    }

    const userId = sessionStorage.getItem('appUserId');
    if (!userId) return; // Prevent unnecessary API calls

    const numericUserId = Number(userId);

    // Fetch user details
    this.masterServices.getAppUser(numericUserId).subscribe({
      next: (user) => {
        this.appUser.next(user);
        sessionStorage.setItem('cached_app_user', JSON.stringify(user));
        
        // store username in session storage as well (supports userName or username)
        const name = (user as any).userName || (user as any).username || '';
        if (name) {
          sessionStorage.setItem('username', name.toString());
        }
        this.getAppUserPhotos(numericUserId);
      },
      error: (err) => {
        console.error('Error fetching user:', err);

        if (err.status === 401) {
          console.warn('Token expired or user not authenticated.');
          // Remove only app user tokens, not admin tokens
          sessionStorage.removeItem('appUserId');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('username');
          sessionStorage.removeItem('cached_app_user');
          sessionStorage.removeItem('cached_profile_photo');
          sessionStorage.removeItem('cached_bg_photo');
          
          // Only redirect to home if on a protected route and not on an admin route
          const protectedRoutes = ['/profile-setting', '/profile-view', '/add-post', '/user-posts'];
          const currentUrl = this.router.url;
          if (protectedRoutes.some(route => currentUrl.startsWith(route)) && !currentUrl.startsWith('/admin')) {
            this.router.navigate(['/home']);
          }
        }
      },
    });
  }

  getAllPosts() {
    // debugger;
    if (!this.isLoggedIn()) {
      return;
    }

    const userId = sessionStorage.getItem('appUserId');
    if (!userId) return; // Prevent unnecessary API calls
    // Fetch user posts
    this.masterServices.getAllPosts().subscribe({
      next: (posts) => {
        this.appPosts.next(posts);
        // console.log('User posts fetched successfully:', posts);
      },
      error: (err) => {
        console.error('Error fetching user posts:', err);
      },
    });
  }

  //==========Updating user =====================
  updateUserData(updatedUser: PublicAppUserDTO) {
    this.appUser.next(updatedUser); // Update the BehaviorSubject
    sessionStorage.setItem('cached_app_user', JSON.stringify(updatedUser));
  }
  private getStoredUser(): PublicAppUserDTO | null {
    const userId = sessionStorage.getItem('appUserId');
    if (userId) {
      this.masterServices
        .getAppUser(Number(userId))
        .subscribe((user) => {
          this.appUser.next(user);
          sessionStorage.setItem('cached_app_user', JSON.stringify(user));
        });
    }
    return null;
  }

  private getAppUserPhotos(userId: number): void {
    const currentPhotos = this.appUserPhotos.value || new AppUserPhotos();
    const photosObj = { ...currentPhotos };

    this.masterServices.getProfilePicture(userId).subscribe({
      next: (image) => {
        if (image) {
          photosObj.profilePhoto = `data:image/jpeg;base64,${image}`;
          sessionStorage.setItem('cached_profile_photo', photosObj.profilePhoto);
          this.updateAppUserPhotos(photosObj);
        }
      },
      error: (err) => console.error('Error fetching profile photo:', err),
    });

    this.masterServices.getBackgroundPicture(userId).subscribe({
      next: (image) => {
        if (image) {
          photosObj.backgroundPhoto = `data:image/jpeg;base64,${image}`;
          sessionStorage.setItem('cached_bg_photo', photosObj.backgroundPhoto);
          this.updateAppUserPhotos(photosObj);
        }
      },
      error: (err) => console.error('Error fetching background photo:', err),
    });
  }

  private updateAppUserPhotos(photos: AppUserPhotos): void {
    this.appUserPhotos.next(photos);
  }

  updateProfilePhoto(userId: number) {
    this.masterServices.getProfilePicture(userId).subscribe(
      (image) => {
        if (image) {
          // Get current state of photos
          const currentPhotos = this.appUserPhotos.value || new AppUserPhotos();

          // Update only the profile photo while keeping the background photo unchanged
          const updatedPhotos: AppUserPhotos = {
            ...currentPhotos,
            profilePhoto: `data:image/jpeg;base64,${image}`,
          };

          // Push updated object to BehaviorSubject
          this.appUserPhotos.next(updatedPhotos);
        }
      },
      (error) => console.log(error)
    );
  }

  updateBackgroundPhoto(userId: number) {
    this.masterServices.getBackgroundPicture(userId).subscribe(
      (image) => {
        const currentObj = this.appUserPhotos.value || new AppUserPhotos();

        const updateObj: AppUserPhotos = {
          ...currentObj,
          backgroundPhoto: `data:image/jpeg;base64,${image}`,
        };

        this.updateAppUserPhotos(updateObj);

        return;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  //=============ENCRYPT USER ID ===========
  encryptUser(userId: number): string {
    const encryptedUser = CryptoJs.AES.encrypt(
      JSON.stringify(userId),
      SECURE_KEY
    ).toString();
    return encryptedUser;
  }

  //=============DEENCRYPT USER ID ===========
  decryptUser(user: string): IAppUser {
    const decryptedUser = CryptoJs.AES.decrypt(user, SECURE_KEY).toString(
      CryptoJs.enc.Utf8
    );
    return JSON.parse(decryptedUser);
  }

  isLoggedIn(): boolean {
    const userId = sessionStorage.getItem('appUserId');
    const token = sessionStorage.getItem('token');
    if (!userId || !token) return false;
    return true;
  }
  userIdExists(): number {
    if (!this.isLoggedIn()) return 0;
    const userId = sessionStorage.getItem('appUserId');
    return userId ? Number(userId) : 0;
  }


  getUserName(): string {
    const userObj = this.appUser.value;
    if (userObj) {
      const name = (userObj as any).userName || (userObj as any).username;
      if (name) return name;
    }
    return sessionStorage.getItem('username') || 'A member';
  }

  snackBarService = inject(SnackBarServiceService);
  logout(): void {
    sessionStorage.removeItem('appUserId'); // remove from session storage
    sessionStorage.clear();
    this.setAppUserId(0); // reset app user ID
    this.appUserId.next(0); // clear BehaviorSubject
    this.appUser.next(null); // clear app user data
    this.appUserPhotos.next(null); // clear photos data
    this.appPosts.next(null); // clear app posts data
    this.snackBarService.showSuccess('Logout successfully!');
    this.router.navigate(['/']);
  }
}
