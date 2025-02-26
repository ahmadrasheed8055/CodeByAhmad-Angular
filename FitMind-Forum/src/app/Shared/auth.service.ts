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
  constructor() {}

  masterServices = inject(MasterService);
  private user = new AppUser();
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
    debugger;
    const user = sessionStorage.getItem('appUser');
    if (user) {
      this.user = this.decryptUser(user);

      this.masterServices.getProfilePicture(this.user.id).subscribe(
        (image) => {
          this.user.ProfilePhoto = 'data:image/jpeg;base64,' + image;

          sessionStorage.setItem('userProfilePhoto', this.user.ProfilePhoto);
        },
        (error) => {
          console.log(error);
        }
      );
    }
    return this.user;
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
