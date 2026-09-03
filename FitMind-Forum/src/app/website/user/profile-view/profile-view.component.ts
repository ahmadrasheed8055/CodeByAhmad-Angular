import {
  Component,
  inject,
  Inject,
  isStandalone,
  NgModule,
} from '@angular/core';
import { PublicAppUserDTO, AppUserPhotos } from '../../../Model/AppUsers';
import { AuthService } from '../../../Shared/auth.service';
import { Subscription, debounceTime, distinctUntilChanged, filter, skip, switchMap, tap } from 'rxjs';
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
import { ProfileSkeletonComponent, PostCardSkeletonComponent } from '../../../Shared/skeleton';
import { ReportModalComponent } from '../../../Shared/components/report-modal/report-modal.component';
import { ReportService } from '../../../Shared/report.service';
import { getTrainerAvatar } from '../../../Shared/trainer-avatars';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [DatePipe, CommonModule, ReactiveFormsModule, CommentsComponent, RouterModule, PollCardComponent, ProfileSkeletonComponent, PostCardSkeletonComponent, ReportModalComponent],
  templateUrl: './profile-view.component.html',
  styleUrl: './profile-view.component.css',
})
export class ProfileViewComponent {
  user: PublicAppUserDTO = new PublicAppUserDTO();
  userPhotos: AppUserPhotos = new AppUserPhotos();
  // masterService = Inject(MasterService);
  userPosts: GetUserPostsDTO[] = [];
  postsLoader: boolean = false;
  isProfileLoading: boolean = true;

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

  // Inline Profile Edit State
  isEditingProfile: boolean = false;
  isSavingProfile: boolean = false;
  editProfileForm!: FormGroup;
  isCheckingUniqueName: boolean = false;
  isUniqueNameTaken: boolean = false;
  private uniqueNameSub?: Subscription;

  countriesList: string[] = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
    'Pakistan', 'India', 'Bulgaria', 'United Arab Emirates', 'Saudi Arabia',
    'Italy', 'Spain', 'Netherlands', 'Brazil', 'Turkey', 'Mexico', 'South Africa',
    'Singapore', 'New Zealand', 'Sweden', 'Norway', 'Denmark', 'Switzerland',
    'Austria', 'Belgium', 'Ireland', 'Poland', 'Portugal', 'Greece', 'Czech Republic',
    'Romania', 'Hungary', 'Egypt', 'Malaysia', 'Indonesia', 'Philippines', 'Vietnam',
    'Thailand', 'Argentina', 'Chile', 'Colombia', 'Peru', 'South Korea', 'Japan', 'China'
  ];

  initEditProfileForm() {
    if (!this.categoriesObj || this.categoriesObj.length === 0) {
      this.masterService.getAllCategories().subscribe({
        next: (cats) => this.categoriesObj = cats || [],
        error: () => this.categoriesObj = []
      });
    }

    this.editProfileForm = new FormGroup({
      username: new FormControl(this.user.username || '', [Validators.required]),
      uniqueName: new FormControl(this.user.uniqueName || '', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern('^[a-zA-Z0-9_]+$')
      ]),
      bio: new FormControl(this.user.bio || ''),
      phone: new FormControl(this.user.phone || ''),
      location: new FormControl(this.user.location || ''),
      country: new FormControl(this.user.country || ''),
      facebookLink: new FormControl(this.user.facebookLink || ''),
      instagramLink: new FormControl(this.user.instagramLink || ''),
      specializationCategoryId: new FormControl(this.user.specializationCategoryId || null),
      yearsOfExperience: new FormControl(this.user.yearsOfExperience || null),
      certifications: new FormControl(this.user.certifications || ''),
      availability: new FormControl(this.user.availability || ''),
      whatsAppNumber: new FormControl(this.user.whatsAppNumber || '')
    });

    this.isUniqueNameTaken = false;
    this.isCheckingUniqueName = false;

    if (this.uniqueNameSub) {
      this.uniqueNameSub.unsubscribe();
    }

    // Live Debounced Check for Unique Name (Just like Instagram)
    this.uniqueNameSub = this.editProfileForm.controls['uniqueName'].valueChanges.pipe(
      skip(1),
      filter((val): val is string => !!val && val.trim().length >= 3),
      distinctUntilChanged(),
      tap(() => {
        this.isCheckingUniqueName = true;
      }),
      debounceTime(600),
      switchMap((uniqueName) => this.masterService.checkUniqueName(uniqueName.trim(), this.user.id))
    ).subscribe({
      next: (isTaken: any) => {
        this.isUniqueNameTaken = !!isTaken;
        this.isCheckingUniqueName = false;
      },
      error: () => {
        this.isCheckingUniqueName = false;
      }
    });
  }

  toggleEditProfile() {
    this.initEditProfileForm();
    this.isEditingProfile = true;
  }

  cancelEditProfile() {
    if (this.uniqueNameSub) {
      this.uniqueNameSub.unsubscribe();
    }
    this.isEditingProfile = false;
  }

  cleanWhatsApp(number?: string): string {
    if (!number) return '';
    return number.replace(/\+/g, '').replace(/\s+/g, '').replace(/-/g, '');
  }

  saveProfile() {
    if (this.editProfileForm.invalid || this.isUniqueNameTaken) {
      this.snackBar.showError('Please check the required fields or unique handle');
      return;
    }

    this.isSavingProfile = true;
    const formVal = this.editProfileForm.value;
    const updatedUser: PublicAppUserDTO = {
      ...this.user,
      username: formVal.username,
      uniqueName: formVal.uniqueName,
      bio: formVal.bio,
      phone: formVal.phone,
      location: formVal.location,
      country: formVal.country,
      facebookLink: formVal.facebookLink,
      instagramLink: formVal.instagramLink,
      specializationCategoryId: formVal.specializationCategoryId ? Number(formVal.specializationCategoryId) : undefined,
      yearsOfExperience: formVal.yearsOfExperience !== null && formVal.yearsOfExperience !== '' ? Number(formVal.yearsOfExperience) : undefined,
      certifications: formVal.certifications,
      availability: formVal.availability,
      whatsAppNumber: formVal.whatsAppNumber
    };

    this.masterService.updateAppUser(this.user.id, updatedUser).subscribe({
      next: () => {
        this.user = updatedUser;
        this.authService.updateUserData(this.user);
        this.snackBar.showSuccess('Profile updated successfully!');
        this.isSavingProfile = false;
        this.isEditingProfile = false;
      },
      error: (err) => {
        this.isSavingProfile = false;
        if (err.status === 409) {
          this.snackBar.showError('Unique handle already taken. Please choose another.');
        } else {
          this.snackBar.showError('Failed to update profile. Please try again.');
        }
      }
    });
  }

  // Post Update State & Routing
  updatePostForm!: FormGroup;
  updatePostButtonLoading: boolean = false;
  router = inject(Router);
  route = inject(ActivatedRoute);
  profileUserId: number = 0;
  activeTab: 'posts' | 'saved' | 'hidden' = 'posts';
  isRefreshing: boolean = false;

  refreshProfileFeed() {
    if (this.isRefreshing) return;
    this.isRefreshing = true;
    this.loadPostsForTab(this.activeTab);
    setTimeout(() => {
      this.isRefreshing = false;
    }, 500);
  }

  onAvatarError() {
    if (this.user && this.user.role === 'Trainer') {
      this.userPhotos = { ...this.userPhotos, profilePhoto: getTrainerAvatar(this.user.username, this.user.id) };
    } else {
      this.userPhotos = { ...this.userPhotos, profilePhoto: '' };
    }
  }

  private subscriptions: Subscription = new Subscription();

  constructor(
    public authService: AuthService,
    private masterService: MasterService,
    private snackBar: SnackBarServiceService,
    public reportService: ReportService
  ) {}

  ngOnInit(): void {
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
        this.isProfileLoading = true;
        this.masterService.getAppUser(this.profileUserId).subscribe({
          next: (user: PublicAppUserDTO) => {
            this.user = user;
            this.isProfileLoading = false;
            
            if (user.role === 'Trainer') {
              this.userPhotos.profilePhoto = getTrainerAvatar(user.username, user.id);
            }

            // Also need to fetch background and profile photos using existing APIs
            this.masterService.getProfilePicture(this.profileUserId).subscribe({
              next: (pic: any) => {
                if (pic && typeof pic === 'string' && pic.length > 50) {
                  let photoUrl = pic.startsWith('data:') ? pic : `data:image/jpeg;base64,${pic}`;
                  if (pic.includes('<svg') || pic.startsWith('PHN2Zy')) {
                    photoUrl = pic.startsWith('<svg') 
                      ? `data:image/svg+xml;utf8,${encodeURIComponent(pic)}`
                      : `data:image/svg+xml;base64,${pic}`;
                  }
                  this.userPhotos = { ...this.userPhotos, profilePhoto: photoUrl };
                }
              },
              error: () => {}
            });
            this.masterService.getBackgroundPicture(this.profileUserId).subscribe({
              next: (bg: any) => { this.userPhotos = { ...this.userPhotos, backgroundPhoto: bg ? `data:image/jpeg;base64,${bg}` : '' }; },
              error: () => {}
            });
            this.loadPostsForTab(this.activeTab);
          },
          error: () => {
            this.isProfileLoading = false;
            this.router.navigate(['/error'], { queryParams: { status: 404 } });
          }
        });
      })
    );

    // Listen to query params for notification deep-link single post view
    this.subscriptions.add(
      this.route.queryParams.subscribe(qParams => {
        if (qParams['postId']) {
          this.filterSinglePostId = +qParams['postId'];
        } else {
          this.filterSinglePostId = 0;
        }
        if (this.profileUserId) {
          this.loadPostsForTab(this.activeTab);
        }
      })
    );
  }

  filterSinglePostId: number = 0;

  clearSinglePostFilter() {
    this.filterSinglePostId = 0;
    this.router.navigate(['/profile-view']);
    this.loadPostsForTab(this.activeTab);
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
        if (this.filterSinglePostId > 0) {
          const matched = posts.filter(p => p.postId === this.filterSinglePostId);
          if (matched.length > 0) {
            this.userPosts = matched;
            this.isCommentsVisibleMap[this.filterSinglePostId] = true;
            this.postsLoader = false;
          } else {
            // Fetch global posts if post belongs to another author
            this.masterService.getAllPosts(0).subscribe({
              next: (allPosts: any[]) => {
                const globalMatch = allPosts.filter(p => p.postId === this.filterSinglePostId);
                this.userPosts = globalMatch;
                this.isCommentsVisibleMap[this.filterSinglePostId] = true;
                this.postsLoader = false;
              },
              error: () => {
                this.userPosts = [];
                this.postsLoader = false;
              }
            });
          }
        } else {
          this.userPosts = posts;
          this.postsLoader = false;
        }
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

  copyProfileLink() {
    const link = window.location.origin + '/profile/' + this.profileUserId;
    navigator.clipboard.writeText(link).then(() => {
      this.snackBar.showSuccess('Profile link copied to clipboard!');
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

  toggleFollowUser() {
    if (!this.authService.isLoggedIn()) {
      this.snackBar.showError('Please log in to follow users');
      return;
    }

    if (this.user.isFollowing) {
      // Unfollow
      this.masterService.unfollowUser(this.user.id).subscribe({
        next: () => {
          this.user.isFollowing = false;
          this.user.followersCount = Math.max(0, this.user.followersCount - 1);
          this.snackBar.showSuccess('Unfollowed user successfully');
        },
        error: () => this.snackBar.showError('Failed to unfollow user')
      });
    } else {
      // Follow
      this.masterService.followUser(this.user.id).subscribe({
        next: () => {
          this.user.isFollowing = true;
          this.user.followersCount += 1;
          this.snackBar.showSuccess('Followed user successfully');
          // Trigger a global force poll if we had SignalR or broadcast, but let's notify the service
          // We can use a broadcast channel to tell other tabs to poll now
          try {
            const bc = new BroadcastChannel('fitmind_community_notifications');
            bc.postMessage({ type: 'FORCE_POLL' });
            bc.close();
          } catch(e) {}
        },
        error: (err) => {
          if (err.status === 400 && err.error === 'Already following this user.') {
             this.user.isFollowing = true;
          } else {
             this.snackBar.showError(err.error || 'Failed to follow user');
          }
        }
      });
    }
  }
}
