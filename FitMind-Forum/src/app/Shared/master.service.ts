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
import { GetUserPostsDTO } from '../Model/GetUserPosts';
import { GetAllPostsDTO } from '../Model/GetAllPostsDTO';
import { PostReactionsDTO } from '../Model/AddPostReaction';
import { GetPostReactionsCount } from '../Model/GetPostReactionsCount';
import {
  CommentReactionDTO,
  GetPostComment,
  PostComments,
} from '../Model/commentDTO';
import { CreatePollDTO, VotePollDTO, PollDTO } from '../Model/PollDTO';

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
              'The server is currently unavailable. Please try again later.',
            );
          } else {
            // Other errors like 404 or 500
            return throwError(
              'An error occurred while fetching categories. Please try again later.',
            );
          }
        }),
      );
  }

  //=====Email Varification API=====
  SEND_EMAIL_API = 'EmailSending/send-email?receptor=';

  sendRegistrationEmail(email: string) {
    const url = this.API_URL + this.SEND_EMAIL_API + encodeURIComponent(email);
    // debugger;

    return this.http.post(url, {});
  }

  //=====FP Email Varification API=====
  SEND_FP_EMAIL_API = 'EmailSending/send-fp-email?receptor=';

  sendForgotPasswordEmail(email: string) {
    // debugger;
    const url =
      this.API_URL +
      'EmailSending/send-fp-email?email=' +
      encodeURIComponent(email);
    return this.http.post(url, {});
  }

  //========Validation on emial registration page
  EMAIL_TOKEN_VALIDATION_API = 'EmailSending/validate-email-token';

  validateEmailToken(token: string) {
    const url =
      this.API_URL + this.EMAIL_TOKEN_VALIDATION_API + '?token=' + token;

    return this.http.get(url, {});
  }

  //==========FP Token Validation==============
  RESET_TOKEN_VALIDATION_API = 'EmailSending/validate-reset-token';

  validateResetToken(token: string) {
    const url = this.API_URL + this.RESET_TOKEN_VALIDATION_API + '?token=' + token;
    return this.http.get(url, {});
  }

  //==========Reset Password==============
  RESET_PASSWORD_API = 'AppUsers/reset-password';

  resetPassword(payload: { token: string; newPassword: string }) {
    const url = this.API_URL + this.RESET_PASSWORD_API;
    return this.http.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
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
    userlogin: UserLoginDTO,
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
  DELETE_DRAFT_POST = 'Post/deleteDraftedPost/{userId}/{postId}';
  deleteDraftedPost(userId: number, postId: number) {
    const url =
      this.API_URL +
      this.DELETE_DRAFT_POST.replace('{userId}', userId.toString()).replace(
        '{postId}',
        postId.toString(),
      );
    return this.http.put(
      url,
      {},
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  //=============Delete post===================
  DELETE_POST = 'Post/deletePost/{userId}/{postId}';
  deletePost(userId: number, postId: number) {
    const url =
      this.API_URL +
      this.DELETE_POST.replace('{userId}', userId.toString()).replace(
        '{postId}',
        postId.toString(),
      );
    return this.http.put(
      url,
      {},
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  //=============Update  post===================
  UPDATE_POST = 'Post/updatePost/';

  updatePost(userId: number, postObj: FormData) {
    const url = this.API_URL + this.UPDATE_POST + userId;
    return this.http.put(url, postObj);
  }

  //=============get  post image===================
  GET_POST_IMAGE = 'Post/getPostImage/';

  getPostImage(userId: number, postId: number) {
    const url = this.API_URL + this.GET_POST_IMAGE + userId + '/' + postId;
    return this.http.get(url);
  }

  //================delete post image=============
  DELETE_POST_IMAGE = 'Post/deletePostPhoto/{userId}/{postId}';
  deletePostImage(userId: number, postId: number) {
    const url =
      this.API_URL +
      this.DELETE_POST_IMAGE.replace('{userId}', userId.toString()).replace(
        '{postId}',
        postId.toString(),
      );
    return this.http.put(url, {});
  }

  //=================Calling user posts==================
  GET_USER_POSTS = 'Post/getUserPosts/{userId}';

  getUserAllPosts(userId: number) {
    const url = `${this.API_URL}${this.GET_USER_POSTS.replace(
      '{userId}',
      userId.toString(),
    )}`;
    return this.http.get<GetUserPostsDTO[]>(url);
  }

  //=================Calling user posts==================
  GET_ALL_POSTS = 'Post/getAllPosts';

  getAllPosts(userId: any = null): Observable<GetAllPostsDTO[]> {
    const url = `${this.API_URL}${this.GET_ALL_POSTS}?userId=${userId}`;
    return this.http.get<GetAllPostsDTO[]>(url);
  }

  // ============ Save Post =================
  savePost(userId: number, postId: number) {
    return this.http.post(`${this.API_URL}Post/savePost/${userId}/${postId}`, {});
  }

  unsavePost(userId: number, postId: number) {
    return this.http.delete(`${this.API_URL}Post/unsavePost/${userId}/${postId}`);
  }

  getSavedPosts(userId: number) {
    return this.http.get<GetAllPostsDTO[]>(`${this.API_URL}Post/getSavedPosts/${userId}`);
  }

  // ============ Hide Post =================
  hidePost(userId: number, postId: number) {
    return this.http.post(`${this.API_URL}Post/hidePost/${userId}/${postId}`, {});
  }

  unhidePost(userId: number, postId: number) {
    return this.http.delete(`${this.API_URL}Post/unhidePost/${userId}/${postId}`);
  }

  getHiddenPosts(userId: number) {
    return this.http.get<GetAllPostsDTO[]>(`${this.API_URL}Post/getHiddenPosts/${userId}`);
  }

  //=================Get post reactions count==================
  GET_POST_REACTIONS_COUNT = 'PostReactions/postReactionsCount/{postId}';
  getPostReactionsCount(postId: number): Observable<GetPostReactionsCount> {
    const url =
      this.API_URL +
      this.GET_POST_REACTIONS_COUNT.replace('{postId}', postId.toString());
    return this.http.get<GetPostReactionsCount>(url);
  }

  //=================Add post reaction==================
  ADD_POST_REACTION = 'PostReactions/addPostReaction';
  addPostReaction(reaction: PostReactionsDTO): Observable<PostReactionsDTO> {
    const url = this.API_URL + this.ADD_POST_REACTION;
    return this.http.post<PostReactionsDTO>(url, reaction, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  //=================Update post reaction==================
  UPDATE_POST_REACTION = 'PostReactions/updateReaction';
  updatePostReaction(reaction: PostReactionsDTO): Observable<PostReactionsDTO> {
    const url = this.API_URL + this.UPDATE_POST_REACTION;
    return this.http.put<PostReactionsDTO>(url, reaction, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  //=================Remove reaction==================
  REMOVE_POST_REACTION = 'PostReactions/removePostReaction/{userId}/{postId}';
  removePostReaction(reaction: PostReactionsDTO): Observable<void> {
    const url =
      this.API_URL +
      this.REMOVE_POST_REACTION.replace(
        '{userId}',
        reaction.userId.toString(),
      ).replace('{postId}', reaction.postId.toString());
    return this.http.request<void>('DELETE', url, {
      body: reaction,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  //=================Comments API==================
  // 1. Add comment
  // service mein return type change
  addComment(payload: PostComments): Observable<{ commentId: number }> {
    return this.http.post<{ commentId: number }>(
      `${this.API_URL}comments/add-comment`,
      payload,
    );
  }

  // 2. Get all comments for a post
  getAllComments(
    postId: number,
    userId?: number,
  ): Observable<GetPostComment[]> {
    let url = `${this.API_URL}comments/getAll/${postId}`;
    if (userId) {
      url += `?userId=${userId}`;
    }
    return this.http.get<GetPostComment[]>(url);
  }

  // 3. Get all comments by a specific user
  getUserComments(userId: number): Observable<GetPostComment[]> {
    return this.http.get<GetPostComment[]>(
      `${this.API_URL}comments/getUserComments/${userId}`,
    );
  }

  // 4. Soft-delete own comment
  deleteComment(userId: number, commentId: number): Observable<any> {
    return this.http.delete(
      `${this.API_URL}comments/delete/${userId}/${commentId}`,
    );
  }

  // 5. Like / Dislike react
  reactToComment(payload: CommentReactionDTO): Observable<any> {
    return this.http.post(`${this.API_URL}comments/react`, payload);
  }

  // 6. Remove reaction
  removeReaction(userId: number, commentId: number): Observable<any> {
    return this.http.delete(
      `${this.API_URL}comments/removeReaction/${userId}/${commentId}`,
    );
  }

  //=================Poll API==================
  createPoll(payload: CreatePollDTO): Observable<any> {
    return this.http.post(`${this.API_URL}polls/create`, payload);
  }

  votePoll(payload: VotePollDTO): Observable<PollDTO> {
    return this.http.post<PollDTO>(`${this.API_URL}polls/vote`, payload);
  }

  addCustomPollOption(payload: any): Observable<any> {
    return this.http.post(`${this.API_URL}polls/add-option`, payload);
  }

  togglePollPin(pollId: number): Observable<any> {
    return this.http.post(`${this.API_URL}polls/toggle-pin/${pollId}`, {});
  }

  togglePollClose(pollId: number): Observable<any> {
    return this.http.post(`${this.API_URL}polls/toggle-close/${pollId}`, {});
  }

  deletePoll(pollId: number): Observable<any> {
    return this.http.delete(`${this.API_URL}polls/${pollId}`);
  }
}
