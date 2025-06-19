import { ICategories } from './../Model/categories';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// it was missing this import statement in app.config.ts file , add this into the config file
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  AppUser,
  changePasswordDTO,
  IAppUser,
  PublicAppUserDTO,
  RegisterUserDTO,
  UpdateAppUserDTO,
  UserLoginDTO,
} from '../Model/AppUsers';
import { AddPostDTO } from '../Model/AddPost';
import { GetDraftedPostDTO } from '../Model/GetDraftedPostDTO';
import { UpdatePostDTO } from '../Model/UpdatePostDTO';

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

  addAppUser(userObj: RegisterUserDTO): Observable<IAppUser> {
    const url = this.API_URL + this.APP_USER_REGISTRATION_URL;
    return this.http.post<IAppUser>(url, userObj);
  }

  //==========User login==============
  APP_USER_LOGIN_URL = 'AppUsers/login-user';

  loginUser(
    userlogin: UserLoginDTO
  ): Observable<{ token: string; userId: number }> {
    const url = this.API_URL + this.APP_USER_LOGIN_URL;
    return this.http.post<{ token: string; userId: number }>(url, userlogin, {
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

  //=============Delete Profile===================
  DELETE_PROFILE_PICTURE_URL = 'AppUsers/delete-profile/';

  deleteProfilePicture(userId: number) {
    const url = this.API_URL + this.DELETE_PROFILE_PICTURE_URL + userId;
    return this.http.put(url, userId);
  }

  //================upload background picture==================
  UPLOAD_BACKGROUND_PICTURE_URL = 'AppUsers/upload-background-image/';
  uploadBackgroundPicture(formData: FormData, userId: number) {
    const url = this.API_URL + this.UPLOAD_BACKGROUND_PICTURE_URL + userId;
    return this.http.put(url, formData);
  }

  //================Get background picture==================
  GET_BACKGROUND_PICTURE_URL = 'AppUsers/get-background-image/';
  getBackgroundPicture(userId: number) {
    const url = this.API_URL + this.GET_BACKGROUND_PICTURE_URL + userId;
    return this.http.get(url);
  }

  //=============Delete Background Picture===================
  DELETE_BACKGROUND_PICTURE_URL = 'AppUsers/delete-background/';

  deleteBackgroundPicture(userId: number) {
    const url = this.API_URL + this.DELETE_BACKGROUND_PICTURE_URL + userId;
    return this.http.put(url, userId);
  }

  //=============Update user===================
  UPDATE_APP_USER = 'AppUsers/update-app-user/';
  updateAppUser(userId: number, appUser: PublicAppUserDTO) {
    const url = this.API_URL + this.UPDATE_APP_USER + userId;
    return this.http.put(url, appUser, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  //=============Update user===================
  CHECK_UNIQUE_NAME = 'AppUsers/check-unique-name?uniqueName=';
  checkUniqueName(uniqueName: string, userId: number) {
    const url =
      this.API_URL + this.CHECK_UNIQUE_NAME + uniqueName + '&userId=' + userId;
    return this.http.get(url);
  }

  //=============Update user password===================
  UPDATE_USER_PASSWORD = 'AppUsers/update-password/';
  updateUserPassword(userId: number, newPasswordObj: changePasswordDTO) {
    const url = this.API_URL + this.UPDATE_USER_PASSWORD + userId;
    return this.http.put(url, newPasswordObj, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  //=============Add post===================
  ADD_POST = 'Post/add-post';
  addPost(formData: FormData) {
    const url = this.API_URL + this.ADD_POST;
    return this.http.post(url, formData, { responseType: 'text' });
  }

  //=============Getting draft posts===================
  GET_DRAFT_POSTS = 'Post/getDrafts/';
  getDraftPosts(userId: number): Observable<GetDraftedPostDTO[]> {
    const url = this.API_URL + this.GET_DRAFT_POSTS + userId;
    return this.http.get<GetDraftedPostDTO[]>(url, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  //=============Availabe draft post===================
  IS_DRAFT_POST_AVAILABLE = 'Post/IsDraftAvailable/';

  isDraftAvailable(userId: number): Observable<boolean> {
    const url = this.API_URL + this.IS_DRAFT_POST_AVAILABLE + userId;
    return this.http.get<boolean>(url, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  //=============Delete draft post===================
  DELETE_DRAFT_POST = 'Post/deleteDraftedPost/';
  deleteDraftedPost(postId: number) {
    const url = this.API_URL + this.DELETE_DRAFT_POST + postId;
    return this.http.put(url,{}, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  //=============Update  post===================
  UPDATE_POST = 'Post/updatePost/';

  updatePost(userId:number, postObj:UpdatePostDTO):Observable<UpdatePostDTO> {
    const url = this.API_URL + this.UPDATE_POST + userId;
    return this.http.put<UpdatePostDTO>(url, postObj, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

}
