import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PostComment, AddCommentRequest } from '../Model/comment.interface';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = 'http://localhost:5177/api/comments';

  constructor(private http: HttpClient) {}

  /**
   * Helper function to normalize API response casing. 
   * This ensures that if the backend returns PascalCase properties (e.g. LikeCount), 
   * they map correctly to the camelCase properties (e.g. likeCount) required by the UI.
   */
  private normalizeComment(c: any): PostComment {
    return {
      ...c,
      commentId: c.commentId ?? c.CommentId,
      postId: c.postId ?? c.PostId,
      userId: c.userId ?? c.UserId,
      commentContent: c.commentContent ?? c.CommentContent,
      createdAt: c.createdAt ?? c.CreatedAt,
      isDeleted: c.isDeleted ?? c.IsDeleted,
      userName: c.userName ?? c.UserName,
      userImage: c.userImage ?? c.UserImage,
      parentCommentId: c.parentCommentId ?? c.ParentCommentId,
      repliesCount: c.repliesCount ?? c.RepliesCount ?? 0,
      likeCount: c.likeCount ?? c.LikeCount ?? 0,
      dislikeCount: c.dislikeCount ?? c.DislikeCount ?? 0,
      isReactedByMe: c.isReactedByMe !== undefined ? c.isReactedByMe : c.IsReactedByMe,
      replies: c.replies ?? c.Replies ?? []
    };
  }

  /**
   * Fetches only ROOT comments for a specific post.
   * @param postId The ID of the post.
   * @param currentUserId The logged-in user's ID (to check reaction state).
   */
  getRootComments(postId: number, currentUserId?: number): Observable<PostComment[]> {
    let params = new HttpParams();
    if (currentUserId) {
      params = params.set('userId', currentUserId.toString());
    }
    return this.http.get<any[]>(`${this.apiUrl}/getAll/${postId}`, { params })
      .pipe(map(comments => comments.map(c => this.normalizeComment(c))));
  }

  /**
   * Fetches nested replies for a specific parent comment.
   * @param commentId The ID of the parent comment.
   * @param currentUserId The logged-in user's ID (to check reaction state).
   */
  getReplies(commentId: number, currentUserId?: number): Observable<PostComment[]> {
    let params = new HttpParams();
    if (currentUserId) {
      params = params.set('userId', currentUserId.toString());
    }
    return this.http.get<any[]>(`${this.apiUrl}/getReplies/${commentId}`, { params })
      .pipe(map(replies => replies.map(r => this.normalizeComment(r))));
  }

  /**
   * Fetches all comments made by a specific user.
   * @param userId The ID of the user.
   */
  getUserComments(userId: number): Observable<PostComment[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getUserComments/${userId}`)
      .pipe(map(comments => comments.map(c => this.normalizeComment(c))));
  }

  /**
   * Creates a new root comment or a nested reply.
   * @param request Payload containing PostId, UserId, Content, and optionally ParentCommentId.
   */
  addComment(request: AddCommentRequest): Observable<{ commentId: number, message: string }> {
    return this.http.post<{ commentId: number, message: string }>(`${this.apiUrl}/add-comment`, request);
  }

  /**
   * Soft-deletes a comment and all of its nested replies.
   * @param userId The ID of the user attempting to delete (must be owner).
   * @param commentId The ID of the comment to delete.
   */
  deleteComment(userId: number, commentId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/delete/${userId}/${commentId}`);
  }

  /**
   * Toggles a LIKE reaction on a comment.
   * @param commentId The ID of the comment.
   * @param userId The ID of the logged-in user making the reaction.
   */
  likeComment(commentId: number, userId: number): Observable<{ message: string }> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.post<{ message: string }>(`${this.apiUrl}/${commentId}/like`, null, { params });
  }

  /**
   * Toggles a DISLIKE reaction on a comment.
   * @param commentId The ID of the comment.
   * @param userId The ID of the logged-in user making the reaction.
   */
  dislikeComment(commentId: number, userId: number): Observable<{ message: string }> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.post<{ message: string }>(`${this.apiUrl}/${commentId}/dislike`, null, { params });
  }
}
