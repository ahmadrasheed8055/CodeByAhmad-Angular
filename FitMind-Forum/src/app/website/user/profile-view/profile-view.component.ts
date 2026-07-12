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
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [DatePipe, CommonModule, ReactiveFormsModule],
  templateUrl: './profile-view.component.html',
  styleUrl: './profile-view.component.css',
})
export class ProfileViewComponent {
  user!: PublicAppUserDTO;
  userPhotos!: AppUserPhotos;
  // masterService = Inject(MasterService);
  userPosts: GetUserPostsDTO[] = [];
  postsLoader: boolean = false;
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

  private subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
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
    //getting all posts
    this.getUserPosts();
  }

  getUserPosts(): void {
    this.postsLoader = true;
    this.masterService.getUserAllPosts(this.user.id).subscribe({
      next: (posts: GetUserPostsDTO[]) => {
        this.userPosts = posts;
        this.postsLoader = false;
        // console.log(this.userPosts);
      },
      error: (err: any) => {
        console.error('Error fetching user posts:', err);
        this.postsLoader = false;
      },
    });
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
    }
  }

  removeImage() {
    this.previewUrl = null;
    this.updatePostForm.patchValue({
      image: null,
    });
  }
  selectedPostImage: string | null = null;
  openFullImageModal(image: string | null = null) {
    this.selectedPostImage = image;
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
    // debugger;
    this.reactionButton = true;
    if (!this.authService.isLoggedIn()) {
      this.snackBarService.showError('Please log in to react to posts');
      this.reactionButton = false;

      return;
    }
    if (isLike === null) {
      this.snackBarService.showError('Please select a reaction');
      this.reactionButton = false;

      return;
    }
    const userId = this.authService.userIdExists();

    const postReaction: PostReactionsDTO = {
      postId: post.postId,
      userId: userId,
      isLike: isLike,
    };

    this.masterService.addPostReaction(postReaction).subscribe(
      (response) => {
        // console.log('Reaction added:', response);
        this.reactionButton = false;

        this.getUserPosts();
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

  openModal(updatePostForm: any, postId: any) {
    debugger;
    this.selectedPost = updatePostForm;
    this.selectedPostId = postId;
    console.log(this.selectedPost, this.selectedPostId);
  }

  deleteUserPostImage() {
    // debugger;
    if (this.selectedPost.value.image !== null) {
      this.masterService
        .deletePostImage(this.userId, this.selectedPostId)
        .subscribe(
          (next) => {
            this.snackBar.showSuccess('Post image deleted successfully');

            this.selectedPost.patchValue({
              image: null,
            });
          },
          (error) => {
            this.snackBar.showError('Error deleting post image');
          }
        );
    

    }

    this.previewUrl = null;
  }
  cancelUpdatePost() {
    this.editingPostId = null;
    this.previewUrl = null;
    // this.updatePostForm.reset();
  }

  isDbImage(imageValue: any): boolean {
    return imageValue && typeof imageValue === 'string';
  }
}
