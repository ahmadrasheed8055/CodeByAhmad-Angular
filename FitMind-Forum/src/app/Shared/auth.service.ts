import { inject, Injectable } from '@angular/core';
import { AppUser, IAppUser, PublicAppUserDTO } from '../Model/AppUsers';
import * as CryptoJs from 'crypto-js';
import { MasterService } from './master.service';
import { BehaviorSubject, Subject, take } from 'rxjs';
const SECURE_KEY = 'FITMIND8055';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private appUser = new BehaviorSubject<PublicAppUserDTO | null>(null);
  appUserData$ = this.appUser.asObservable();
  masterServices = inject(MasterService);

  constructor() {
    this.getStoredUser();
  }

  setUser(userId: number) {
    if (!userId) return; // Prevent unnecessary API calls

    this.masterServices
      .getAppUser(userId)
      .pipe(take(1))
      .subscribe({
        next: (user) => {
          console.log(user);
          this.appUser.next(user); // ✅ Store user in BehaviorSubject
        },

        error: (error) => {
          console.error(error);
        },
      });
  }

  private getStoredUser(): PublicAppUserDTO | null {
    const userId = sessionStorage.getItem('appUserId');
    if (userId) {
      this.masterServices.getAppUser((Number(userId))).subscribe((user) => this.appUser.next(user)); // ✅ Store user in BehaviorSubjectuserId)

    }
    return null;
    
  }
  updateUserData(updatedUser: PublicAppUserDTO) {
    this.appUser.next(updatedUser); // Update the BehaviorSubject
  }

 

  // imageUrl$:Subject<any> = new Subject();

  // Encrypt the user object
  encryptUser(user: IAppUser): string {
    const encryptedUser = CryptoJs.AES.encrypt(
      JSON.stringify(user),
      SECURE_KEY
    ).toString();
    return encryptedUser;
  }

  // Decrypt the user object
  decryptUser(user: string): IAppUser {
    const decryptedUser = CryptoJs.AES.decrypt(user, SECURE_KEY).toString(
      CryptoJs.enc.Utf8
    );
    return JSON.parse(decryptedUser);
  }

  setUser1(user: IAppUser) {
    sessionStorage.setItem('appUser', this.encryptUser(user));
  }

  //get user
  // getUser(): IAppUser {
  //   // debugger;
  //   const user = sessionStorage.getItem('appUser');
  //   if (user) {
  //     this.user = this.decryptUser(user);
  //     // debugger;
  //     console.log(this.user);

  //     // this.updateProfilePhoto();
  //     // this.updateBackgroundPhoto();
  //     // this.setUser(this.user);
  //   }
  //   return this.user;
  // }

  updateProfilePhoto(userId: number) {
    this.masterServices.getProfilePicture(userId).subscribe(
      (image) => {
        // debugger;
        // this.user.profilePhoto = 'data:image/jpeg;base64,' + image;
        return 'data:image/jpeg;base64,' + image;
        // this.setUser(this.user);
        //  console.log(sessionStorage.getItem('appUser'));
      },
      (error) => {
        console.log(error);
      }
    );
  }

  // updateBackgroundPhoto() {
  //   this.masterServices.getBackgroundPicture(this.user.id).subscribe(
  //     (image) => {
  //       // this.user.backgroundPhoto = 'data:image/jpeg;base64,' + image;
  //     },
  //     (error) => {
  //       console.log(error);
  //     }
  //   );
  // }

  //checking user is logged in or not
  isLoggedIn() {
    const user = sessionStorage.getItem('appUserId');
    if (user) {
      return true;
    }
    return false;
  }
}
