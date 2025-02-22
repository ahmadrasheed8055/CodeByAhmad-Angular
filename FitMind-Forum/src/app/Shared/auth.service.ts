import { Injectable } from '@angular/core';
import { IAppUser } from '../Model/AppUsers';
import * as CryptoJs from 'crypto-js';
const SECURE_KEY = 'FITMIND8055';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}

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

  //checking user is logged in or not
  isLoggedIn() {
    const user = sessionStorage.getItem('appUser');
    if (user) {
      return true;
    }
    return false;
  }
}
