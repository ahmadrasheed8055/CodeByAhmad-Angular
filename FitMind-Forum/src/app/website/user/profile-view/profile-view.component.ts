import {
  Component,
  inject,
  Inject,
  isStandalone,
  NgModule,
} from '@angular/core';
import { PublicAppUserDTO, AppUserPhotos } from '../../../Model/AppUsers';
import { AuthService } from '../../../Shared/auth.service';
import { Subscription } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { MasterService } from '../../../Shared/master.service';
import { GetUserPostsDTO } from '../../../Model/GetUserPosts';
import { Pipe, PipeTransform } from '@angular/core';
import { SnackBarServiceService } from '../../../Shared/snack-bar-service.service';
import {
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ICategories } from '../../../Model/categories';
import { PostReactionsDTO } from '../../../Model/AddPostReaction';
import { GetAllPostsDTO } from '../../../Model/GetAllPostsDTO';
import { debug } from 'node:console';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommentsComponent } from '../../posts/comments/comments.component';
import { PollCardComponent } from '../../posts/poll-card/poll-card.component';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [DatePipe, CommonModule, ReactiveFormsModule, CommentsComponent, RouterModule, PollCardComponent],
  templateUrl: './profile-view.component.html',
  styleUrl: './profile-view.component.css',
})
export class ProfileViewComponent {
  user!: PublicAppUserDTO;
  userPhotos!: AppUserPhotos;
  // masterService = Inject(MasterService);
  userPosts: GetUserPostsDTO[] = [];
  postsLoader: boolean = false;

  isCommentsVisibleMap: { [key: number]: boolean } = {};
  commentCounts: { [key: number]: number } = {};

  toggleComments(postId: number) {
    this.isCommentsVisibleMap[postId] = !this.isCommentsVisibleMap[postId];
  }

  onPollDeleted(pollId: number) {
    this.userPosts = this.userPosts.filter(p => !p.poll || p.poll.pollId !== pollId);
  }
  // selectedPostId: number = 0;
  selectedPost!: FormGroup; // the form
  selectedPostId!: number; // only the ID
  editingPostId: number | null = null;
  categoriesObj: ICategories[] = [];

  userId: number = Number(sessionStorage.getItem('appUserId')) || 0;

  //update form
  updatePostForm!: FormGroup;
  updatePostButtonLoading: boolean = false;


  router = inject(Router);
  route = inject(ActivatedRoute);

  profileUserId: number = 0;
  activeTab: 'posts' | 'saved' | 'hidden' = 'posts';

  private subscriptions: Subscription = new Subscription();

  constructor(
    public authService: AuthService,
    private masterService: MasterService,
    private snackBar: SnackBarServiceService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.authService.appUserData$.subscribe((user: any) => {
        this.user = user;
      })
    );

    this.subscriptions.add(
      this.authService.appUserPhotos$.subscribe((photos: any) => {
        this.userPhotos = photos;
      })
    );
    if(!this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
    this.subscriptions.add(
      this.route.paramMap.subscribe(params => {
        const idParam = params.get('id');
        if (idParam) {
          this.profileUserId = +idParam;
        } else {
          this.profileUserId = this.authService.userIdExists();
        }
        
        if (!this.profileUserId) {
          this.router.navigate(['/']);
          return;
        }

        // Fetch the user's profile info
        this.masterService.getAppUser(this.profileUserId).subscribe({
          next: (user: PublicAppUserDTO) => {
            this.user = user;
            // Also need to fetch background and profile photos using existing APIs
            this.masterService.getProfilePicture(this.profileUserId).subscribe({
              next: (pic: any) => { this.userPhotos = { ...this.userPhotos, profilePhoto: pic ? `data:image/jpeg;base64,${pic}` : '' }; },
              error: () => {}
            });
            this.masterService.getBackgroundPicture(this.profileUserId).subscribe({
              next: (bg: any) => { this.userPhotos = { ...this.userPhotos, backgroundPhoto: bg ? `data:image/jpeg;base64,${bg}` : '' }; },
              error: () => {}
            });
            this.loadPostsForTab(this.activeTab);
          },
          error: () => {
            this.router.navigate(['/error?status=404']);
          }
        });
      })
    );
  }

  setActiveTab(tab: 'posts' | 'saved' | 'hidden') {
    this.activeTab = tab;
    this.loadPostsForTab(tab);
  }

  loadPostsForTab(tab: 'posts' | 'saved' | 'hidden') {
    if (tab === 'posts') {
      this.getUserPosts();
    } else if (tab === 'saved') {
      this.getSavedPosts();
    } else if (tab === 'hidden') {
      this.getHiddenPosts();
    }
  }

  getUserPosts(): void {
    this.postsLoader = true;
    this.userPosts = [];
    this.masterService.getUserAllPosts(this.profileUserId).subscribe({
      next: (posts: GetUserPostsDTO[]) => {
        this.userPosts = posts;
        this.postsLoader = false;
      },
      error: (err: any) => {
        console.error('Error fetching user posts:', err);
        this.postsLoader = false;
      },
    });
  }

  getSavedPosts(): void {
    this.postsLoader = true;
    this.userPosts = [];
    this.masterService.getSavedPosts(this.profileUserId).subscribe({
      next: (posts: any[]) => {
        this.userPosts = posts.filter(post => !post.isHidden);
        this.postsLoader = false;
      },
      error: (err: any) => {
        console.error('Error fetching saved posts:', err);
        this.postsLoader = false;
      },
    });
  }

  getHiddenPosts(): void {
    this.postsLoader = true;
    this.userPosts = [];
    this.masterService.getHiddenPosts(this.profileUserId).subscribe({
      next: (posts: any[]) => {
        this.userPosts = posts;
        this.postsLoader = false;
      },
      error: (err: any) => {
        console.error('Error fetching hidden posts:', err);
        this.postsLoader = false;
      },
    });
  }

  hidePost(post: any) {
    if (!this.authService.isLoggedIn()) {
      this.snackBar.showError('Please log in to hide/unhide posts');
      return;
    }
    
    if (this.activeTab === 'hidden') {
      this.masterService.unhidePost(this.user.id, post.postId).subscribe({
        next: () => {
          this.userPosts = this.userPosts.filter(p => p.postId !== post.postId);
          this.snackBar.showSuccess('Post unhidden');
        },
        error: () => this.snackBar.showError('Failed to unhide post')
      });
    } else {
      this.masterService.hidePost(this.user.id, post.postId).subscribe({
        next: () => {
          this.userPosts = this.userPosts.filter(p => p.postId !== post.postId);
          this.snackBar.showSuccess('Post hidden');
        },
        error: () => this.snackBar.showError('Failed to hide post')
      });
    }
  }

  toggleSavePost(post: any) {
    if (!this.authService.isLoggedIn()) {
      this.snackBar.showError('Please log in to save posts');
      return;
    }
    if (post.isSavedByMe) {
      this.masterService.unsavePost(this.user.id, post.postId).subscribe({
        next: () => {
          post.isSavedByMe = false;
          this.snackBar.showSuccess('Post unsaved');
          if (this.activeTab === 'saved') {
            this.userPosts = this.userPosts.filter(p => p.postId !== post.postId);
          }
        },
        error: () => this.snackBar.showError('Failed to unsave post')
      });
    } else {
      this.masterService.savePost(this.user.id, post.postId).subscribe({
        next: () => {
          post.isSavedByMe = true;
          this.snackBar.showSuccess('Post saved');
        },
        error: () => this.snackBar.showError('Failed to save post')
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
    this.snackBar.showSuccess('Link copied to clipboard!');
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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

  clearUpdatePostForm(): void {
    this.editingPostId = null;
    this.updatePostForm.reset();
  }

  previewUrl: string | ArrayBuffer | null = null;
  openFileInput(event: any) {
    // debugger;
    const file = event.target as HTMLInputElement;
    if (file.files && file.files.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file.files[0]);
      // console.log(file.files[0]);
      this.updatePostForm.patchValue({
        image: file.files[0],
      });
      this.updatePostForm.get('image')?.markAsDirty();
      this.updatePostForm.markAsDirty();
      this.updatePostForm.updateValueAndValidity();
    }
  }

  removeImage() {
    this.previewUrl = null;
    this.updatePostForm.patchValue({
      image: null,
    });
    this.updatePostForm.get('image')?.markAsDirty();
    this.updatePostForm.markAsDirty();
    this.updatePostForm.updateValueAndValidity();
  }
  selectedPostImage: string | null = null;
  openFullImageModal(image: string | null = null) {
    if (image && !image.startsWith('data:image')) {
      this.selectedPostImage = 'data:image/jpeg;base64,' + image;
    } else {
      this.selectedPostImage = image;
    }
  }

  closeFullImageModal() {
    // debugger;
    this.selectedPostImage = null;
  }

  enableUpdatePost(post: GetUserPostsDTO): void {
    // debugger;

    this.editingPostId = post.postId;
    this.masterService.getAllCategories().subscribe(
      (next: any) => {
        this.categoriesObj = next;
      },
      (error) => {
        this.snackBar.showError(error.message);
      }
    );
    // debugger;
    this.updatePostForm = new FormGroup({
      title: new FormControl(post.title, [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(100),
      ]),
      description: new FormControl(post.description, [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(1000),
      ]),
      category: new FormControl(post.categoryId, [Validators.required]),
      image: new FormControl(post.postImageUrl),
    });
    if (post.postImageUrl) {
      this.previewUrl = `data:image/jpeg;base64,${post.postImageUrl}`;
    }

    // console.log(this.updatePostForm.value);
  }

  //udpate drafted post and publish it function
  updateUserPost(post: GetUserPostsDTO) {
  // debugger;

  this.updatePostButtonLoading = true;

  const imageFile = this.updatePostForm.get('image')?.value;

  // -------------------------------------
  // 🔥 1. Detect if the image is a real file or DB bytes
  // -------------------------------------
  const isRealFile = imageFile instanceof File;

  // -------------------------------------
  // 🔥 2. Validate ONLY if the user selected a NEW file
  // -------------------------------------
  if (isRealFile) {

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

    if (!allowedTypes.includes(imageFile.type)) {
      this.snackBar.showError('Only JPG, JPEG, PNG, or WEBP formats are allowed.');
      this.updatePostButtonLoading = false;
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (imageFile.size > maxSize) {
      this.snackBar.showError('Image size must be less than 2MB.');
      this.updatePostButtonLoading = false;
      return;
    }
  }

  // -------------------------------------
  // ✔ Build FormData
  // -------------------------------------
  const formData = new FormData();
  formData.append('PostId', post.postId.toString());
  formData.append('Title', this.updatePostForm.value.title);
  formData.append('Description', this.updatePostForm.value.description);
  formData.append('IsPublished', 'true');
  formData.append('CategoryId', this.updatePostForm.value.category.toString());

  // -------------------------------------
  // 🔥 3. Only append real file (not DB bytes)
  // -------------------------------------
  if (isRealFile) {
    formData.append('PostImage', imageFile);
  }

  // -------------------------------------
  // ✔ Submit
  // -------------------------------------
  this.masterService.updatePost(this.userId, formData).subscribe(
    (next) => {
      this.getUserPosts();
      this.clearUpdatePostForm();
      this.previewUrl = null;
      this.updatePostButtonLoading = false;

      this.snackBar.showSuccess('Post Updated successfully');
    },
    (error) => {
      this.updatePostButtonLoading = false;
    }
  );
}


  confirmDraftDelete(postId: number | null) {
    if (postId === null) {
      this.snackBar.showError('Post ID is null');
      return;
    }
    // debugger;
    this.selectedPostId = postId;

    this.masterService.deletePost(this.userId, postId).subscribe(
      (next) => {
        this.snackBar.showSuccess('Post deleted successfully');
        debugger;
        //create prototype for this
        const index = this.userPosts.findIndex((x) => x.postId === postId);
        if (index > -1) {
          this.userPosts.splice(index, 1); // Remove the deleted post from the list
        }
        // this.getUserPosts(); // Refresh the posts list after deletion
        this.selectedPostId = 0;
      },
      (error) => {
        if (error.status === 404) {
          this.snackBar.showError('Post not found');
        } else {
          this.snackBar.showError('An error occurred while deleting post');
        }
      }
    );
  }

  snackBarService = inject(SnackBarServiceService);
  reactionButton: boolean = false;
  // Function to handle post reaction
  addPostReaction(isLike: boolean | null, post: GetUserPostsDTO) {
    if (!this.authService.isLoggedIn()) {
      this.snackBarService.showError('Please log in to react to posts');
      return;
    }
    if (isLike === null) {
      this.snackBarService.showError('Please select a reaction');
      return;
    }
    const userId = this.authService.userIdExists();

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
    this.masterService.addPostReaction(postReaction).subscribe({
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

  openModal(updatePostForm: any, postId: any) {
    debugger;
    this.selectedPost = updatePostForm;
    this.selectedPostId = postId;
    console.log(this.selectedPost, this.selectedPostId);
  }

  deleteUserPostImage() {
    // debugger;
    if (this.selectedPost && this.selectedPost.value.image !== null) {
      this.masterService
        .deletePostImage(this.userId, this.selectedPostId)
        .subscribe(
          (next) => {
            this.snackBar.showSuccess('Post image deleted successfully');

            this.selectedPost.patchValue({
              image: null,
            });
            this.selectedPost.get('image')?.markAsDirty();
            this.selectedPost.markAsDirty();
            this.selectedPost.updateValueAndValidity();
          },
          (error) => {
            this.snackBar.showError('Error deleting post image');
          }
        );
    }

    this.previewUrl = null;
    if (this.updatePostForm) {
      this.updatePostForm.get('image')?.markAsDirty();
      this.updatePostForm.markAsDirty();
      this.updatePostForm.updateValueAndValidity();
    }
  }
  cancelUpdatePost() {
    this.editingPostId = null;
    this.previewUrl = null;
    // this.updatePostForm.reset();
  }

  isDbImage(imageValue: any): boolean {
    return imageValue && typeof imageValue === 'string';
  }

  onUploadProfilePhoto(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      this.snackBar.showError('Only JPEG, PNG, or JPG files are allowed');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    this.masterService.uploadProfilePicture(formData, this.user.id).subscribe({
      next: () => {
        this.snackBar.showSuccess('Profile picture updated successfully!');
        this.authService.updateProfilePhoto(this.user.id);
      },
      error: () => {
        this.snackBar.showError('Error uploading profile picture');
      }
    });
  }

  onUploadBackgroundPhoto(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      this.snackBar.showError('Only JPEG, PNG, or JPG files are allowed');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    this.masterService.uploadBackgroundPicture(formData, this.user.id).subscribe({
      next: () => {
        this.snackBar.showSuccess('Background cover updated successfully!');
        this.authService.updateBackgroundPhoto(this.user.id);
      },
      error: () => {
        this.snackBar.showError('Error uploading background cover');
      }
    });
  }
}
