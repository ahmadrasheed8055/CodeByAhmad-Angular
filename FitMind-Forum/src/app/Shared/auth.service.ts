import { inject, Injectable } from '@angular/core';
import { AppUser, IAppUser } from '../Model/AppUsers';
import * as CryptoJs from 'crypto-js';
import { MasterService } from './master.service';
import { Subject } from 'rxjs';
const SECURE_KEY = 'FITMIND8055';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {
    this.user = new AppUser();
  }

  // imageUrl$:Subject<any> = new Subject();

  masterServices = inject(MasterService);
  public user: AppUser;
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

  setUser(user: IAppUser) {
    sessionStorage.setItem('appUser', this.encryptUser(user));
  }

  //get user
  getUser(): IAppUser {
    // debugger;
    const user = sessionStorage.getItem('appUser');
    if (user) {
      this.user = this.decryptUser(user);
      // debugger;
      console.log(this.user);
     

     this.updateProfilePhoto();
     this.updateBackgroundPhoto();
      this.setUser(this.user);
    }
    return this.user;
  }

  updateProfilePhoto() {
    this.masterServices.getProfilePicture(this.user.id).subscribe(
      (image) => {
        // debugger;
        this.user.profilePhoto = 'data:image/jpeg;base64,' + image;
        this.setUser(this.user);
        //  console.log(sessionStorage.getItem('appUser'));
      },
      (error) => {
        console.log(error);
      }
    );
  }

  updateBackgroundPhoto() {
    this.masterServices.getBackgroundPicture(this.user.id).subscribe(
      (image) => {
        this.user.backgroundPhoto = 'data:image/jpeg;base64,' + image;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  //checking user is logged in or not
  isLoggedIn() {
    const user = sessionStorage.getItem('appUser');
    if (user) {
      return true;
    }
    return false;
  }
}
