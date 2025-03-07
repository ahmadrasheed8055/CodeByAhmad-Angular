import { ICategories } from './../Model/categories';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// it was missing this import statement in app.config.ts file , add this into the config file
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  AppUser,
  IAppUser,
  PublicAppUserDTO,
  UpdateAppUserDTO,
  UserLoginDTO,
} from '../Model/AppUsers';

@Injectable({
  providedIn: 'root',
})
export class MasterService {
  constructor(private http: HttpClient) {}

  API_URL = 'http://localhost:5177/api/';

  //=====Categories API=====
  GET_ALL_CATEGORIES = 'Categories';

  getAllCategories(): Observable<ICategories[]> {
    return this.http
      .get<ICategories[]>(this.API_URL + this.GET_ALL_CATEGORIES)
      .pipe(
        catchError((error) => {
          if (error.status === 0) {
            // Network error or server down
            return throwError(
              'The server is currently unavailable. Please try again later.'
            );
          } else {
            // Other errors like 404 or 500
            return throwError(
              'An error occurred while fetching categories. Please try again later.'
            );
          }
        })
      );
  }

  //=====Email Varification API=====
  SEND_EMAIL_API = 'EmailSending/send-email?receptor=';

  sendRegistrationEmail(email: string) {
    // debugger;
    const url = this.API_URL + this.SEND_EMAIL_API + encodeURIComponent(email);

    return this.http.post(url, {});
  }

  //========Validation on emial registration page
  EMAIL_TOKEN_VALIDATION_API = 'EmailSending/validate-email-token';

  validateEmailToken(token: string) {
    const url =
      this.API_URL + this.EMAIL_TOKEN_VALIDATION_API + '?token=' + token;

    return this.http.get(url, {});
  }

  //==========User registration==============
  APP_USER_REGISTRATION_URL = 'AppUsers/add-app-user';

  addAppUser(userObj: AppUser): Observable<IAppUser> {
    const url = this.API_URL + this.APP_USER_REGISTRATION_URL;
    return this.http.post<IAppUser>(url, userObj);
  }

  //==========User login==============
  APP_USER_LOGIN_URL = 'AppUsers/login-user';

  loginUser(userlogin: UserLoginDTO): Observable<number> {
    const url = this.API_URL + this.APP_USER_LOGIN_URL;
    return this.http.post<number>(url, userlogin, {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  //==========User getting==============
  GET_USER = 'AppUsers/get-user/';

  getAppUser(userId: number): Observable<PublicAppUserDTO> {
    const url = this.API_URL + this.GET_USER + userId;
    return this.http.get<PublicAppUserDTO>(url, {
      headers: { 'Content-Type': 'application/json' },
    });
  }


  //==========Uploading profile picture==============
  UPLOAD_PROFILE_PICTURE_URL = 'AppUsers/upload-image/';

  uploadProfilePicture(formData: FormData, userId: number) {
    const url = this.API_URL + this.UPLOAD_PROFILE_PICTURE_URL + userId;
    return this.http.put(url, formData);
  }
  //==========Get profile picture==============
  GET_PROFILE_PICTURE_URL = 'AppUsers/get-image/';

  getProfilePicture(userId: number) {
    const url = this.API_URL + this.GET_PROFILE_PICTURE_URL + userId;
    return this.http.get(url);
  }

  //================upload background picture==================
  UPLOAD_BACKGROUND_PICTURE_URL = 'AppUsers/upload-background-image/';
  uploadBackgroundPicture(formData: FormData, userId: number) {
    const url = this.API_URL + this.UPLOAD_BACKGROUND_PICTURE_URL + userId;
    return this.http.put(url, formData);
  }

  GET_BACKGROUND_PICTURE_URL = 'AppUsers/get-background-image/';
  getBackgroundPicture(userId: number) {
    const url = this.API_URL + this.GET_BACKGROUND_PICTURE_URL + userId;
    return this.http.get(url);
  }

  //=============Update user===================
  UPDATE_APP_USER = 'AppUsers/update-app-user/';
  updateAppUser(userId: number, appUser: PublicAppUserDTO) {
    const url = this.API_URL + this.UPDATE_APP_USER + userId;
    return this.http.put(url, appUser, {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/*
create guard then implement or add in route like array, then add conditions
*/
