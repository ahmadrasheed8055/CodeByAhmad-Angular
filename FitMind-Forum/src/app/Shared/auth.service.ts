import { Injectable } from '@angular/core';
import { IAppUser } from '../Model/AppUsers';
// import * as CryptoJs from 'crypto-js';
const SECURE_KEY = 'FITMIND8055';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}
  // encryptUser(user: IAppUser):string {
  //   // return CryptoJs.AES.encrypt(JSON.stringify(user), SECURE_KEY).toString();
  // }
}
