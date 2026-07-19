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
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { MasterService } from '../../../Shared/master.service';
import { AuthService } from '../../../Shared/auth.service';
import { SnackBarServiceService } from '../../../Shared/snack-bar-service.service';
import {
  CommentReactionDTO,
  GetPostComment,
  PostComments,
} from '../../../Model/commentDTO';
import { AppUserPhotos } from '../../../Model/AppUsers';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css'],
})
export class CommentsComponent implements OnInit, OnChanges {
  @Input() postId!: number;
  @Input() showCommentsList: boolean = false;
  @Output() commentCountChanged = new EventEmitter<number>();

  masterService: MasterService = inject(MasterService);
  authService: AuthService = inject(AuthService);

  allComments: GetPostComment[] = [];
  visibleComments: GetPostComment[] = [];
  isLoading = false;
  newCommentText = '';
  userId: number = 0;
  userName: string = '';
  userImage: string = '';
  currentCount: number = 0;
  pageSize: number = 3;
  openReplies: { [key: number]: boolean } = {};

  snakBarService: SnackBarServiceService = inject(SnackBarServiceService);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    // this.fetchCurrentUser();
  }

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
    }
  }

  handleInputFocus(): void {
    if (!this.userId) {
      this.snakBarService.showError('Please log in to add a comment.');
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // when parent sets/changes postId, (re)load comments
    if (changes['postId'] && changes['postId'].currentValue) {
      this.loadComments();
    }
  }

  timeAgo(date: Date | string): string {
    const inputDate = new Date(date);
    const now = new Date();
    const seconds = Math.floor((+now - +inputDate) / 1000);
    if (seconds < 10) return 'Just now';
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      // Show full date with year
      return inputDate.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1 || Math.floor(seconds / 86400) > 6) {
      // Show short date without year (for < 1 year but older than 6 days)
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

  getCommentAvatar(image: string | null): string {
    if (!image) return '/img/avatar/default.png';
    if (image.startsWith('data:')) return image;
    return 'data:image/jpeg;base64,' + image;
  }

  private loadComments(): void {
    this.isLoading = true;
    this.masterService.getAllComments(this.postId, this.userId).subscribe({
      next: (data) => {
        this.allComments = data;
        this.currentCount = 3; // Initial number of comments to show
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

  toggleReplies(commentId: number): void {
    this.openReplies[commentId] = !this.openReplies[commentId];
  }

  isRepliesOpen(commentId: number): boolean {
    return !!this.openReplies[commentId];
  }

  //fetching image of user
  fetchCurrentUser(): void {
    this.masterService.getProfilePicture(this.userId).subscribe({
      next: (image) => {
        this.userImage = image ? `data:image/jpeg;base64,${image}` : '';
      },
      error: (err) => console.error('Error fetching profile photo:', err),
    });
  }

  fetchComments(): void {
    this.loadComments();
  }
  //posting comment
  submitComment(): void {
    if (!this.userId) {
      this.snakBarService.showError('Please log in to add a comment.');
      return;
    }

    const text = this.newCommentText.trim();
    if (!text) return;

    const payload: PostComments = {
      PostId: this.postId,
      UserId: this.userId,
      CommentContent: text,
    };

    this.masterService.addComment(payload).subscribe({
      next: (res) => {
        // Backend sirf ID deta hai, baaki data hum khud jodte hain (jo already pata hai)
        const newComment: GetPostComment = {
          commentId: res.commentId,
          postId: this.postId,
          userId: this.userId,
          userName: this.userName, // from session storage
          userImage: this.userImage, // from database
          commentContent: text,
          createdAt: 'Just now',
          likeCount: 0,
          dislikeCount: 0,
          currentUserReaction: null,
          replies: [],
        };

        this.allComments.unshift(newComment);
        // keep visibleComments in sync
        this.visibleComments.unshift(newComment);
        this.newCommentText = '';
        this.snakBarService.showSuccess('Comment added successfully.');
        this.commentCountChanged.emit(this.allComments.length);
      },
      error: (err) => {
        console.error('Comment add fail hua:', err);
        this.snakBarService.showError(
          err?.error?.message || 'Failed to add comment.',
        );
      },
    });
  }

  // react(comment: GetPostComment, isLike: boolean): void {}

  // ---- Delete own comment ----
  deleteComment(comment: GetPostComment): void {
    if (comment.userId !== this.userId) return; // safety — sirf apna hi delete

    this.masterService.deleteComment(this.userId, comment.commentId).subscribe({
      next: () => {
        this.allComments = this.allComments.filter(
          (c) => c.commentId !== comment.commentId,
        );
        this.updateVisible();
        this.commentCountChanged.emit(this.allComments.length);
      },
      error: (err) => {
        console.error('Delete fail hua:', err);
        this.snakBarService.showError('Failed to delete comment.');
      },
    });
  }

  // ---- Like / Dislike toggle ----
  react(comment: GetPostComment, isLike: boolean): void {
    const alreadySameReaction = comment.currentUserReaction === isLike;

    if (alreadySameReaction) {
      // same button dobara click = reaction remove (toggle off)
      this.masterService
        .removeReaction(this.userId, comment.commentId)
        .subscribe({
          next: () => {
            if (isLike) comment.likeCount = (comment.likeCount || 1) - 1;
            else comment.dislikeCount = (comment.dislikeCount || 1) - 1;
            comment.currentUserReaction = null;
          },
          error: (err) => {
            console.error('Reaction remove fail hui:', err);
            this.snakBarService.showError('Failed to remove reaction.');
          },
        });
      return;
    }

    const payload: CommentReactionDTO = {
      CommentId: comment.commentId,
      UserId: this.userId,
      IsLike: isLike,
    };

    this.masterService.reactToComment(payload).subscribe({
      next: () => {
        // optimistic local update — agar previous reaction thi to uska count bhi adjust karein
        if (comment.currentUserReaction === true)
          comment.likeCount = (comment.likeCount || 1) - 1;
        if (comment.currentUserReaction === false)
          comment.dislikeCount = (comment.dislikeCount || 1) - 1;

        if (isLike) comment.likeCount = (comment.likeCount || 0) + 1;
        else comment.dislikeCount = (comment.dislikeCount || 0) + 1;

        comment.currentUserReaction = isLike;
      },
      error: (err) => {
        console.error('Reaction fail hui:', err);
        this.snakBarService.showError('Failed to update reaction.');
      },
    });
  }
}
