/* CodeByAhmad - FitMind Forum Standard Professional Module */

import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
  PLATFORM_ID,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MasterService } from '../../../Shared/master.service';
import { CommentService } from '../../../Shared/comment.service';
import { AuthService } from '../../../Shared/auth.service';
import { SnackBarServiceService } from '../../../Shared/snack-bar-service.service';
import { NotificationService } from '../../../Shared/notification.service';
import { PendingActionService } from '../../../Shared/pending-action.service';
import {
  PostComment,
  AddCommentRequest
} from '../../../Model/comment.interface';
import { CommentSkeletonComponent } from '../../../Shared/skeleton';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, CommentSkeletonComponent],
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css'],
})
export class CommentsComponent implements OnInit, OnChanges {
  @Input() postId!: number;
  @Input() postAuthorUserId?: number;
  @Input() showCommentsList: boolean = false;
  @Output() commentCountChanged = new EventEmitter<number>();

  masterService: MasterService = inject(MasterService);
  commentService: CommentService = inject(CommentService);
  authService: AuthService = inject(AuthService);
  notificationService: NotificationService = inject(NotificationService);
  pendingActionService: PendingActionService = inject(PendingActionService);

  allComments: PostComment[] = [];
  visibleComments: PostComment[] = [];
  isLoading = false;
  isSubmitting = false;
  newCommentText = '';
  userId: number = 0;
  userName: string = '';
  userImage: string = '';
  currentCount: number = 0;
  pageSize: number = 3;
  openReplies: { [key: number]: boolean } = {};
  
  // State for replying
  replyingToCommentId: number | null = null;
  replyText: { [key: number]: string } = {};

  snakBarService: SnackBarServiceService = inject(SnackBarServiceService);
  private platformId = inject(PLATFORM_ID);

  constructor() {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.appUserId$.subscribe((id) => {
        const oldUserId = this.userId;
        this.userId = id || 0;
        
        if (this.userId !== oldUserId) {
          if (this.userId) {
            this.fetchCurrentUser();
          } else {
            this.userImage = '';
          }
          if (this.postId) {
            this.loadComments();
          }
        }
      });

      this.authService.appUserData$.subscribe((user) => {
        if (user) {
          this.userName = user.username || '';
        } else {
          this.userName = '';
        }
      });

      // Subscribe to pending action replay after login
      this.pendingActionService.actionReady$.subscribe(({ action, userId }) => {
        switch (action.type) {
          case 'SUBMIT_COMMENT': {
            if (action.postId === this.postId && action.text) {
              this.newCommentText = action.text;
              // Small delay to ensure userId is set
              setTimeout(() => this.submitComment(), 100);
            }
            break;
          }
          case 'REPLY_COMMENT': {
            if (action.postId === this.postId) {
              this.replyingToCommentId = action.parentCommentId;
              if (action.text) {
                this.replyText[action.parentCommentId] = action.text;
                const parent = this.allComments.find(c => c.commentId === action.parentCommentId);
                if (parent) {
                  setTimeout(() => this.submitReply(parent), 100);
                }
              }
            }
            break;
          }
          case 'REACT_COMMENT': {
            const comment = this.allComments.find(c => c.commentId === action.commentId);
            if (comment) {
              setTimeout(() => this.react(comment, action.isLike), 100);
            }
            break;
          }
        }
      });
    }
  }

  handleInputFocus(): void {
    if (!this.userId) {
      this.pendingActionService.setPendingAction({ type: 'SUBMIT_COMMENT', postId: this.postId, text: this.newCommentText || '' });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['postId'] && changes['postId'].currentValue) {
      this.loadComments();
    }
    if (changes['showCommentsList'] && changes['showCommentsList'].currentValue === false) {
      this.replyText = {};
      this.openReplies = {};
      this.newCommentText = '';
      this.replyingToCommentId = null;
    }
  }

  timeAgo(date: Date | string): string {
    if (!date) return '';
    const inputDate = new Date(date);
    const now = new Date();
    const seconds = Math.floor((+now - +inputDate) / 1000);
    if (seconds < 10) return 'Just now';
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return inputDate.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1 || Math.floor(seconds / 86400) > 6) {
      return inputDate.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
      });
    }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval > 1 ? 's' : ''} ago`;
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hour${interval > 1 ? 's' : ''} ago`;
    interval = Math.floor(seconds / 60);
    if (interval >= 1)
      return `${interval} minute${interval > 1 ? 's' : ''} ago`;
    return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
  }

  getCommentAvatar(image: string | null | undefined): string {
    if (!image) return '/img/avatar/default.png';
    if (image.startsWith('data:')) return image;
    return 'data:image/jpeg;base64,' + image;
  }

  private loadComments(): void {
    this.isLoading = true;
    this.commentService.getRootComments(this.postId, this.userId).subscribe({
      next: (data) => {
        this.allComments = data;
        this.currentCount = 3;
        this.updateVisible();
        this.isLoading = false;
        this.commentCountChanged.emit(this.allComments.length);
      },
      error: () => (this.isLoading = false),
    });
  }

  private updateVisible(): void {
    this.visibleComments = this.allComments.slice(0, this.currentCount);
  }

  toggleComments(): void {
    if (this.currentCount < this.allComments.length) {
      this.currentCount += this.pageSize;
    } else {
      this.currentCount = 3;
    }
    this.updateVisible();
  }

  get showToggleBtn(): boolean {
    return this.allComments.length > 3;
  }

  toggleReplies(comment: PostComment): void {
    this.openReplies[comment.commentId] = !this.openReplies[comment.commentId];
    
    // Fetch replies if opening and they are not loaded
    if (this.openReplies[comment.commentId] && !comment.replies) {
      this.commentService.getReplies(comment.commentId, this.userId).subscribe({
        next: (replies) => {
          comment.replies = replies;
        },
        error: (err) => console.error('Failed to load replies:', err)
      });
    }
  }

  isRepliesOpen(commentId: number): boolean {
    return !!this.openReplies[commentId];
  }

  fetchCurrentUser(): void {
    this.masterService.getProfilePicture(this.userId).subscribe({
      next: (image: any) => {
        this.userImage = image ? `data:image/jpeg;base64,${image}` : '';
      },
      error: (err) => console.error('Error fetching profile photo:', err),
    });
  }

  fetchComments(): void {
    this.loadComments();
  }

  submitComment(): void {
    if (!this.userId) {
      const text = this.newCommentText.trim();
      if (text) {
        this.pendingActionService.setPendingAction({ type: 'SUBMIT_COMMENT', postId: this.postId, text });
      } else {
        this.pendingActionService.setPendingAction({ type: 'SUBMIT_COMMENT', postId: this.postId, text: '' });
      }
      return;
    }
    if (this.isSubmitting) return;

    const text = this.newCommentText.trim();
    if (!text) return;

    this.isSubmitting = true;

    const payload: AddCommentRequest = {
      postId: this.postId,
      userId: this.userId,
      commentContent: text,
    };

    this.commentService.addComment(payload).subscribe({
      next: (res) => {
        const newComment: PostComment = {
          commentId: res.commentId,
          postId: this.postId,
          userId: this.userId,
          userName: this.userName,
          userImage: this.userImage,
          commentContent: text,
          createdAt: new Date().toISOString(),
          isDeleted: false,
          likeCount: 0,
          dislikeCount: 0,
          repliesCount: 0,
          isReactedByMe: null,
          replies: [],
        };

        this.allComments.unshift(newComment);
        this.visibleComments.unshift(newComment);
        this.newCommentText = '';
        this.snakBarService.showSuccess('Comment added successfully.');
        this.commentCountChanged.emit(this.allComments.length);
        this.isSubmitting = false;

        if (this.postAuthorUserId) {
          this.notificationService.notifyNewComment(this.postAuthorUserId, this.userName || 'A member', text, this.postId);
        }
      },
      error: (err) => {
        console.error('Comment add fail hua:', err);
        this.snakBarService.showError(
          err?.error?.message || 'Failed to add comment.',
        );
        this.isSubmitting = false;
      },
    });
  }
  
  startReply(commentId: number): void {
    if (!this.userId) {
      this.pendingActionService.setPendingAction({ type: 'REPLY_COMMENT', postId: this.postId, parentCommentId: commentId, text: '' });
      return;
    }
    this.replyingToCommentId = commentId;
    this.openReplies[commentId] = true;
    
    // Load replies so the user can see their reply appear
    const comment = this.allComments.find(c => c.commentId === commentId);
    if (comment && !comment.replies) {
       this.commentService.getReplies(comment.commentId, this.userId).subscribe({
        next: (replies) => {
          comment.replies = replies;
        }
       });
    }
  }

  cancelReply(): void {
    this.replyingToCommentId = null;
  }
  
  submitReply(parentComment: PostComment): void {
    if (!this.userId) {
      const text = (this.replyText[parentComment.commentId] || '').trim();
      this.pendingActionService.setPendingAction({ type: 'REPLY_COMMENT', postId: this.postId, parentCommentId: parentComment.commentId, text });
      return;
    }
    if (this.isSubmitting) return;

    const text = (this.replyText[parentComment.commentId] || '').trim();
    if (!text) return;

    this.isSubmitting = true;

    const payload: AddCommentRequest = {
      postId: this.postId,
      userId: this.userId,
      commentContent: text,
      parentCommentId: parentComment.commentId
    };

    this.commentService.addComment(payload).subscribe({
      next: (res) => {
        const newReply: PostComment = {
          commentId: res.commentId,
          postId: this.postId,
          userId: this.userId,
          userName: this.userName,
          userImage: this.userImage,
          commentContent: text,
          createdAt: new Date().toISOString(),
          isDeleted: false,
          parentCommentId: parentComment.commentId,
          likeCount: 0,
          dislikeCount: 0,
          repliesCount: 0,
          isReactedByMe: null,
          replies: [],
        };

        if (!parentComment.replies) {
            parentComment.replies = [];
        }
        parentComment.replies.push(newReply);
        parentComment.repliesCount++;
        
        this.replyText[parentComment.commentId] = '';
        this.replyingToCommentId = null;
        this.snakBarService.showSuccess('Reply added successfully.');
        this.isSubmitting = false;

        if (parentComment.userId) {
          this.notificationService.notifyCommentReply(parentComment.userId, this.userName || 'A member', text, this.postId);
        }
      },
      error: (err) => {
        console.error('Reply add fail hua:', err);
        this.snakBarService.showError(
          err?.error?.message || 'Failed to add reply.',
        );
        this.isSubmitting = false;
      },
    });
  }

  deleteComment(comment: PostComment, parentComment?: PostComment): void {
    if (comment.userId !== this.userId) return;

    this.commentService.deleteComment(this.userId, comment.commentId).subscribe({
      next: () => {
        if (parentComment && parentComment.replies) {
            // It's a reply
            parentComment.replies = parentComment.replies.filter(
                (c) => c.commentId !== comment.commentId
            );
            parentComment.repliesCount--;
        } else {
            // It's a root comment
            this.allComments = this.allComments.filter(
              (c) => c.commentId !== comment.commentId,
            );
            this.updateVisible();
            this.commentCountChanged.emit(this.allComments.length);
        }
        this.snakBarService.showSuccess('Comment deleted successfully.');
      },
      error: (err) => {
        console.error('Delete fail hua:', err);
        this.snakBarService.showError('Failed to delete comment.');
      },
    });
  }

  react(comment: PostComment, isLike: boolean): void {
    if (!this.userId) {
      this.pendingActionService.setPendingAction({ type: 'REACT_COMMENT', commentId: comment.commentId, isLike });
      return;
    }

    const wasLiked = comment.isReactedByMe === true;
    const wasDisliked = comment.isReactedByMe === false;

    if (isLike) {
      this.commentService.likeComment(comment.commentId, this.userId).subscribe({
        next: (res) => {
            if (wasLiked) {
                // Toggled off
                comment.likeCount--;
                comment.isReactedByMe = null;
            } else {
                if (wasDisliked) comment.dislikeCount--;
                comment.likeCount++;
                comment.isReactedByMe = true;
                if (comment.userId) {
                  this.notificationService.notifyCommentReaction(comment.userId, this.userName || 'A member', true);
                }
            }
        },
        error: () => this.snakBarService.showError('Failed to like comment.')
      });
    } else {
      this.commentService.dislikeComment(comment.commentId, this.userId).subscribe({
        next: (res) => {
             if (wasDisliked) {
                // Toggled off
                comment.dislikeCount--;
                comment.isReactedByMe = null;
             } else {
                if (wasLiked) comment.likeCount--;
                comment.dislikeCount++;
                comment.isReactedByMe = false;
             }
        },
        error: () => this.snakBarService.showError('Failed to dislike comment.')
      });
    }
  }
}
