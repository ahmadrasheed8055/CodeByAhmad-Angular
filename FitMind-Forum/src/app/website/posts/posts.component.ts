import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AddPostComponent } from '../user/add-post/add-post.component';
import { MasterService } from '../../Shared/master.service';
import { SnackBarServiceService } from '../../Shared/snack-bar-service.service';
import { GetAllPostsDTO } from '../../Model/GetAllPostsDTO';
import { PostReactionsDTO } from '../../Model/AddPostReaction';
import { GetPostReactionsCount } from '../../Model/GetPostReactionsCount';
import { AuthService } from '../../Shared/auth.service';
import { CommentsComponent } from './comments/comments.component';

@Component({
  selector: 'app-posts',
  imports: [CommonModule, AddPostComponent,CommentsComponent],
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css'],
})
export class PostsComponent implements OnInit {
  constructor() {}
  posts!: GetAllPostsDTO[];
  MasterService = inject(MasterService);
  AuthService = inject(AuthService);
  snackBarService = inject(SnackBarServiceService);
  userId: number = Number(sessionStorage.getItem('appUserId'));
  postReactionsCount: GetPostReactionsCount | null = null;
  reactionIcons: boolean = false;

  ngOnInit() {
    this.AuthService.appUserId$.subscribe((userId) => {
      if (userId) {
        this.userId = userId;
      }
      this.getAllPosts();
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
  addPostReaction(isLike: boolean | null,post:GetAllPostsDTO ) {
    // debugger;
    this.reactionButton = true;
    if (!this.AuthService.isLoggedIn()) {
      this.snackBarService.showError('Please log in to react to posts');
    this.reactionButton = false;

      return;
    }
    if (isLike === null) {
      this.snackBarService.showError('Please select a reaction');
    this.reactionButton = false;

      return;
    }
     const userId = this.AuthService.userIdExists();

    const postReaction: PostReactionsDTO = {
      postId: post.postId,
      userId: userId,
      isLike: isLike,
    };

    this.MasterService.addPostReaction(postReaction).subscribe(
      (response) => {
        // console.log('Reaction added:', response);
    this.reactionButton = false;

        this.getAllPosts();
        // this.snackBarService.showSuccess('Reaction added successfully');
      },
      (error) => {
        // if (error.status === 400) {
        //  this.MasterService.updatePostReaction(postReaction).subscribe({
        //     next: (updatedReaction) => {
        //       console.log('Reaction updated:', updatedReaction);
        //       this.getAllPosts();
        //       this.snackBarService.showSuccess('Reaction updated successfully');
        //     },
        //     error: (updateError) => {
        //       console.error('Error updating reaction:', updateError);
        //       this.snackBarService.showError('Error updating reaction');
        //     }
        //  });

        //   return;
        // }
        // console.error('Error adding reaction:', error);
         this.reactionButton = false;

        this.snackBarService.showError('Error adding reaction');
      }
    );
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
}

