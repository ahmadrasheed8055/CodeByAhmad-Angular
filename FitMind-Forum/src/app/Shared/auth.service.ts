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

  masterServices = inject(MasterService);

  constructor() {
    const userId = sessionStorage.getItem('appUserId');
    if (userId) {
      this.setAppUserId(Number(userId));
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
        this.getAppUserPhotos(numericUserId);
      },
      error: (err) => {
        console.error('Error fetching user:', err);

        // Check for Unauthorized error
        if (err.status === 401) {
          console.warn('Token expired or user not authenticated.');

          // Remove token and logout
          sessionStorage.clear();
          this.router.navigate(['']);
        } else {
          // Remove token and logout
          sessionStorage.clear();
          this.router.navigate(['']);
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
  }
  private getStoredUser(): PublicAppUserDTO | null {
    const userId = sessionStorage.getItem('appUserId');
    if (userId) {
      this.masterServices
        .getAppUser(Number(userId))
        .subscribe((user) => this.appUser.next(user)); // ✅ Store user in BehaviorSubjectuserId)
    }
    return null;
  }

  private getAppUserPhotos(userId: number): void {
    const photosObj = new AppUserPhotos();

    this.masterServices.getProfilePicture(userId).subscribe({
      next: (image) => {
        photosObj.profilePhoto = `data:image/jpeg;base64,${image}`;
        this.updateAppUserPhotos(photosObj);
      },
      error: (err) => console.error('Error fetching profile photo:', err),
    });

    this.masterServices.getBackgroundPicture(userId).subscribe({
      next: (image) => {
        photosObj.backgroundPhoto = `data:image/jpeg;base64,${image}`;
        this.updateAppUserPhotos(photosObj);
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
    const userId = sessionStorage.getItem('appUserId');
    return userId ? Number(userId) : 0;
  }


snackBarService = inject(SnackBarServiceService);
  logout(): void {
    sessionStorage.removeItem('appUserId'); // remove from session storage
    sessionStorage.clear();
    this.setAppUserId(0); // reset app user ID
    this.appUserId.next(0); // clear BehaviorSubject
    this.appUser.next(null); // clear app user data
    this.appPosts.next(null); // clear app posts data
    this.snackBarService.showSuccess('Logout successfully!');
    this.router.navigate(['/']);
  }
}
