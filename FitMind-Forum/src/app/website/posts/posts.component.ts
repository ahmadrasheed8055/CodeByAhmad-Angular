import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { AddPostComponent } from '../user/add-post/add-post.component';
import { MasterService } from '../../Shared/master.service';
import { SnackBarServiceService } from '../../Shared/snack-bar-service.service';
import { GetAllPostsDTO } from '../../Model/GetAllPostsDTO';
import { PostReactionsDTO } from '../../Model/AddPostReaction';
import { GetPostReactionsCount } from '../../Model/GetPostReactionsCount';
import { AuthService } from '../../Shared/auth.service';
import { CommentsComponent } from './comments/comments.component';

import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PollCardComponent } from './poll-card/poll-card.component';
import { CreatePollDTO } from '../../Model/PollDTO';

@Component({
  selector: 'app-posts',
  imports: [CommonModule, CommentsComponent, RouterModule, FormsModule, PollCardComponent],
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css'],
})
export class PostsComponent implements OnInit {
  constructor() {}
  posts!: GetAllPostsDTO[];
  MasterService = inject(MasterService);
  AuthService = inject(AuthService);
  snackBarService = inject(SnackBarServiceService);
  userId: number = 0;
  currentUserImage: string = '';
  postReactionsCount: GetPostReactionsCount | null = null;
  reactionIcons: boolean = false;
  selectedPostId: number = 0;

  pollQuestion: string = '';
  pollOptions: string[] = ['', ''];
  selectedPollCategory: number = 0;
  pollExpiresAt: string = '';
  isSubmittingPoll: boolean = false;
  categories: any[] = [];
  pollAllowUserOptions: boolean = false;
  pollIsMultipleChoice: boolean = false;
  pollAllowVoteEdit: boolean = false;

  enableUpdatePost(post: any) {
    // Implementation pending
  }
  commentCounts: { [key: number]: number } = {};
  isCommentsVisibleMap: { [key: number]: boolean } = {};
  private platformId = inject(PLATFORM_ID);

  toggleComments(postId: number) {
    this.isCommentsVisibleMap[postId] = !this.isCommentsVisibleMap[postId];
  }

  onPollDeleted(pollId: number) {
    this.posts = this.posts.filter(p => !p.poll || p.poll.pollId !== pollId);
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.AuthService.appUserId$.subscribe((userId) => {
        this.userId = userId || 0;
        this.getAllPosts();
      });

      this.AuthService.appUserPhotos$.subscribe((photos) => {
        if (photos && photos.profilePhoto && photos.profilePhoto !== 'data:image/jpeg;base64,null') {
          this.currentUserImage = photos.profilePhoto;
        }
      });
    } else {
      this.getAllPosts();
    }

    this.MasterService.getAllCategories().subscribe(res => {
      this.categories = res;
      if (this.categories && this.categories.length > 0) {
        this.selectedPollCategory = this.categories[0].id;
      }
    });
  }

  getPostReactionsCount(postId: number) {
    this.MasterService.getPostReactionsCount(postId).subscribe(
      (response) => {
        console.log('Post reactions count:', response);
      //  return response;
      },
      (error) => {
        console.error('Error fetching post reactions count:', error);
        // this.snackBarService.showError('Error fetching post reactions count');
      }
    );
  }


  getAllPosts() {
    // debugger;
     const userId = this.AuthService.userIdExists();
     if (userId === 0) {
      this.userId = 0;
     }
    //  debugger;

    this.MasterService.getAllPosts(this.userId).subscribe((posts: GetAllPostsDTO[]) => {

      this.posts = posts;
      console.log('Posts fetched:', this.posts);
    });
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


  getPostReactionCount(postId: number) {
    this.MasterService.getPostReactionsCount(postId).subscribe(
      (response : GetPostReactionsCount) => {
        console.log('Post reactions count:', response);
        // this.postReactionsCount = response;
        return response;
      },
      (error) => {
        console.error('Error fetching post reactions count:', error);
        this.snackBarService.showError('Error fetching post reactions count');
      }
    );
  }

  reactionButton: boolean = false;
  // Function to handle post reaction
  addPostReaction(isLike: boolean | null, post: GetAllPostsDTO) {
    if (!this.AuthService.isLoggedIn()) {
      this.snackBarService.showError('Please log in to react to posts');
      return;
    }
    if (isLike === null) {
      this.snackBarService.showError('Please select a reaction');
      return;
    }
    
    const userId = this.AuthService.userIdExists();

    // 1. Backup original states for potential rollback
    const originalReaction = post.isReactedByMe;
    const originalLikes = post.likeCount;
    const originalDislikes = post.dislikeCount;

    // 2. Optimistic State Updates
    if (isLike) {
      if (post.isReactedByMe === true) {
        // Undo like
        post.isReactedByMe = null;
        post.likeCount = Math.max(0, (post.likeCount || 0) - 1);
      } else {
        if (post.isReactedByMe === false) {
          // Switch from dislike to like
          post.dislikeCount = Math.max(0, (post.dislikeCount || 0) - 1);
        }
        post.isReactedByMe = true;
        post.likeCount = (post.likeCount || 0) + 1;
      }
    } else {
      if (post.isReactedByMe === false) {
        // Undo dislike
        post.isReactedByMe = null;
        post.dislikeCount = Math.max(0, (post.dislikeCount || 0) - 1);
      } else {
        if (post.isReactedByMe === true) {
          // Switch from like to dislike
          post.likeCount = Math.max(0, (post.likeCount || 0) - 1);
        }
        post.isReactedByMe = false;
        post.dislikeCount = (post.dislikeCount || 0) + 1;
      }
    }

    const postReaction: PostReactionsDTO = {
      postId: post.postId,
      userId: userId,
      isLike: isLike,
    };

    // 3. Silent API Dispatch
    this.MasterService.addPostReaction(postReaction).subscribe({
      next: () => {
        // Optimistic UI updated already, do NOT trigger heavy list refreshes!
      },
      error: () => {
        // Rollback states on sync failure
        post.isReactedByMe = originalReaction;
        post.likeCount = originalLikes;
        post.dislikeCount = originalDislikes;
        this.snackBarService.showError('Sync failed. Please try again.');
      }
    });
  }

  hidePost(post: GetAllPostsDTO) {
    if (!this.AuthService.isLoggedIn()) {
      this.snackBarService.showError('Please log in to hide posts');
      return;
    }
    this.MasterService.hidePost(this.userId, post.postId).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.postId !== post.postId);
        this.snackBarService.showSuccess('Post hidden');
      },
      error: () => {
        this.snackBarService.showError('Failed to hide post');
      }
    });
  }

  toggleSavePost(post: GetAllPostsDTO) {
    if (!this.AuthService.isLoggedIn()) {
      this.snackBarService.showError('Please log in to save posts');
      return;
    }
    if (post.isSavedByMe) {
      this.MasterService.unsavePost(this.userId, post.postId).subscribe({
        next: () => {
          post.isSavedByMe = false;
          this.snackBarService.showSuccess('Post unsaved');
        },
        error: () => this.snackBarService.showError('Failed to unsave post')
      });
    } else {
      this.MasterService.savePost(this.userId, post.postId).subscribe({
        next: () => {
          post.isSavedByMe = true;
          this.snackBarService.showSuccess('Post saved');
        },
        error: () => this.snackBarService.showError('Failed to save post')
      });
    }
  }

  shareLink: string = '';
  openShareModal(postId: number) {
    this.shareLink = window.location.origin + '/post/' + postId;
  }

  copyShareLink(inputElement: HTMLInputElement) {
    inputElement.select();
    document.execCommand('copy');
    this.snackBarService.showSuccess('Link copied to clipboard!');
  }

   selectedPostImage: string | null = null;
  openFullImageModal(image: string | null = null) {
    this.selectedPostImage = image;
  }

  closeFullImageModal() {
    // debugger;
    this.selectedPostImage = null;
  }


  deletePostImage() {
    // if (this.updateDraftButton) {
    //   this.masterService
    //     .deletePostImage(this.draftedPost.userId, this.draftedPost.postId)
    //     .subscribe(
    //       (next) => {
    //         this.postForm.patchValue({
    //           image: null,
    //         });
    //         this.snackBar.showSuccess(
    //           'Drafted post image deleted successfully'
    //         );
    //       },
    //       (error) => {
    //         this.snackBar.showError('Error deleting drafted post image');
    //       }
    //     );
    // }
    // this.previewUrl = null;
  }

  trackByFn(index: any, item: any) {
    return index;
  }

  addPollOption() {
    if (this.pollOptions.length < 10) {
      this.pollOptions.push('');
    } else {
      this.snackBarService.showError('Maximum 10 options allowed.');
    }
  }

  removePollOption(index: number) {
    if (this.pollOptions.length > 2) {
      this.pollOptions.splice(index, 1);
    }
  }

  submitPoll() {
    if (!this.pollQuestion.trim()) {
      this.snackBarService.showError('Please enter a poll question.');
      return;
    }
    const validOptions = this.pollOptions.filter(o => o.trim() !== '');
    if (validOptions.length < 2) {
      this.snackBarService.showError('Please provide at least 2 options.');
      return;
    }

    this.isSubmittingPoll = true;
    const payload: CreatePollDTO = {
      title: this.pollQuestion,
      categoryId: this.selectedPollCategory,
      options: validOptions,
      userId: this.userId,
      expiresAt: this.pollExpiresAt ? new Date(this.pollExpiresAt) : null,
      allowUserOptions: this.pollAllowUserOptions,
      isMultipleChoice: this.pollIsMultipleChoice,
      allowVoteEdit: this.pollAllowVoteEdit
    };

    this.MasterService.createPoll(payload).subscribe({
      next: (res) => {
        this.snackBarService.showSuccess('Poll created successfully!');
        this.isSubmittingPoll = false;
        
        // Reset form
        this.pollQuestion = '';
        this.pollOptions = ['', ''];
        this.pollExpiresAt = '';
        this.pollAllowUserOptions = false;
        this.pollIsMultipleChoice = false;
        this.pollAllowVoteEdit = false;
        
        // Close modal
        document.getElementById('closePollModalBtn')?.click();
        
        // Refresh feed
        this.getAllPosts();
      },
      error: (err) => {
        this.snackBarService.showError('Failed to create poll');
        this.isSubmittingPoll = false;
      }
    });
  }
}

