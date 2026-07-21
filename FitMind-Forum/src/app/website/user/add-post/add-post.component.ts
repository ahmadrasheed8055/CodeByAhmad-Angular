import {
  Component,
  inject,
  NgModule,
  ViewChild,
  viewChild,
  ElementRef,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MasterService } from '../../../Shared/master.service';
import { ICategories } from '../../../Model/categories';
import { SnackBarServiceService } from '../../../Shared/snack-bar-service.service';
import { CommonModule } from '@angular/common';
import { AddPostDTO } from '../../../Model/AddPost';
import { GetDraftedPostDTO } from '../../../Model/GetDraftedPostDTO';
import { UpdatePostDTO } from '../../../Model/UpdatePostDTO';
import { Router } from '@angular/router';
import { PostReactionsDTO } from '../../../Model/AddPostReaction';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-post',
  imports: [ReactiveFormsModule, NgSelectModule, CommonModule],
  templateUrl: './add-post.component.html',
  styleUrl: './add-post.component.css',
})
export class AddPostComponent {
  postForm: FormGroup;
  masterService = inject(MasterService);
  categoriesObj: ICategories[] = [];
  previewUrl: string | ArrayBuffer | null = null;
  addPostDTO: AddPostDTO | null = null;
  snackBar = inject(SnackBarServiceService);
  saveButtonDisabled: boolean = false;
  draftButtonDisabled: boolean = false;
  buttonLoading: 'publish' | 'draft' | null = null;
  draftedPosts: GetDraftedPostDTO[] | null = null;
  draftedPost: any;
  IsdraftedPostAvailable: boolean = false;
  updateDraftButton: boolean = false;
  selectedPostId: number = 0;

  // postId: number | null = null;
  userId: number = Number(sessionStorage.getItem('appUserId')) || 0;
  // userId: number =
  updatePostObj: UpdatePostDTO | null = null;

  constructor(private fb: FormBuilder, private router: Router) {
    this.postForm = new FormGroup({
      title: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(100),
      ]),
      description: new FormControl('', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(1000),
      ]),
      category: new FormControl('', [Validators.required]),
      image: new FormControl(''),
    });
  }

  ngOnInit() {
    const userId = sessionStorage.getItem('appUserId');

    this.getAllCategories();
    this.masterService.isDraftAvailable(Number(userId)).subscribe((next) => {
      this.IsdraftedPostAvailable = next;
    });
  }

  //close modal function
  @ViewChild('closeModal') closeModalButton: any;
  closeModal() {
    if (this.closeModalButton) {
      this.closeModalButton.nativeElement.click();
    }
  }

  getAllCategories() {
    this.masterService.getAllCategories().subscribe(
      (next: any) => {
        this.categoriesObj = next;
      },
      (error) => {
        this.snackBar.showError(error.message);
      }
    );
  }

  openFileInput(event: any) {
    const file = event.target as HTMLInputElement;
    if (file.files && file.files.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file.files[0]);
      // console.log(file.files[0]);
      this.postForm.patchValue({
        image: file.files[0],
      });
      this.postForm.get('image')?.markAsDirty();
      this.postForm.markAsDirty();
      this.postForm.updateValueAndValidity();
    }
  }

  removeImage() {
    if (this.updateDraftButton) {
      this.masterService
        .deletePostImage(this.draftedPost.userId, this.draftedPost.postId)
        .subscribe(
          (next) => {
            this.postForm.patchValue({
              image: null,
            });
            this.postForm.get('image')?.markAsDirty();
            this.postForm.markAsDirty();
            this.postForm.updateValueAndValidity();
            this.snackBar.showSuccess(
              'Drafted post image deleted successfully'
            );
          },
          (error) => {
            this.snackBar.showError('Error deleting drafted post image');
          }
        );
    }
    this.previewUrl = null;
    this.postForm.get('image')?.markAsDirty();
    this.postForm.markAsDirty();
    this.postForm.updateValueAndValidity();
  }

  //add post
  onSubmit(type: 'publish' | 'draft') {
    this.buttonLoading = type;

    if (this.postForm.valid) {
      const formData = new FormData();
      const userId = sessionStorage.getItem('appUserId');

      formData.append('Title', this.postForm.value.title);
      formData.append('Description', this.postForm.value.description);
      if (type === 'draft') {
        formData.append('IsPublished', 'false');
      } else if (type === 'publish') {
        formData.append('IsPublished', 'true');
      }
      formData.append('UserId', String(userId));
      formData.append('CategoryId', this.postForm.value.category);

      const file = this.postForm.get('image')?.value;
      if (file) {
        formData.append('PostImage', file);
      }

      this.masterService.addPost(formData).subscribe(
        (next) => {
          if (type === 'draft') {
            this.snackBar.showSuccess('Post saved as draft');
            this.IsdraftedPostAvailable = true;
            this.getDraftedPost();
            this.clearForm();
          } else if (type === 'publish') {
            this.snackBar.showSuccess('Post published successfully');
            this.redirectingToProfile();
          }
          this.buttonLoading = null;
        },
        (error) => {
          if (error.status === 400) {
            this.snackBar.showError(error.error);
          } else if (error.status === 404) {
            this.snackBar.showError('Category not found');
          } else if (error.status === 422) {
            this.snackBar.showError('Inappropriate content.');
          } else if (error.status === 500) {
            this.snackBar.showError('Server error: ' + error.error);
          } else {
            this.snackBar.showError('An unexpected error occurred.');
          }
          this.buttonLoading = null;
        }
      );
    }
  }

  getDraftedPost() {
    const userId = sessionStorage.getItem('appUserId');
    if (!userId) {
      this.snackBar.showError('User not found');
      return;
    }

    this.masterService.getDraftPosts(Number(userId)).subscribe(
      (next) => {
        this.draftedPosts = next;
      },
      (error) => {
        if (error.status === 404) {
          // this.snackBar.showError('No drafted post found for this user');
        } else {
          // this.snackBar.showError('An error occurred while fetching drafted post');
        }
        this.draftedPosts = null;
        this.IsdraftedPostAvailable = false;
      }
    );
  }

  confirmDraftDelete(postId: number | null) {
    if (postId === null) {
      this.snackBar.showError('Post ID is null');
      return;
    }
    debugger;
    this.selectedPostId = postId;

    this.masterService.deleteDraftedPost(this.userId, postId).subscribe(
      (next) => {
        this.updateDraftButton = false;
        this.previewUrl = null;
        this.snackBar.showSuccess('Drafted post deleted successfully');
        this.getDraftedPost();
        this.selectedPostId = 0;
        this.postForm.reset();
      },
      (error) => {
        if (error.status === 404) {
          this.snackBar.showError('Drafted post not found');
        } else {
          this.snackBar.showError(
            'An error occurred while deleting drafted post'
          );
        }
      }
    );
  }
  @ViewChild('closeDraftModalButton')
  closeDraftModalButton!: ElementRef<HTMLButtonElement>;

  updateDraftPostButton(postId: number) {
    this.draftedPost = this.draftedPosts?.find((x) => x.postId == postId);
    // console.log(this.draftedPost);
    if (this.draftedPost) {
      this.postForm.patchValue({
        title: this.draftedPost.title,
        description: this.draftedPost.description,
        category: this.draftedPost.categoryId,
      });

      this.masterService
        .getPostImage(this.draftedPost.userId, this.draftedPost.postId)
        .subscribe(
          (image) => {
            this.previewUrl = `data:image/jpeg;base64,${image}`;
          },
          (error) => {
            this.previewUrl = null;
          }
        );
      // this.selectedPostId = obj.postId;
      // this.userId = obj.userId;
    }
    this.updateDraftButton = true;
    this.closeDraftModalButton.nativeElement.click();
  }

  clearForm() {
    this.postForm.reset();
    this.previewUrl = null;
    this.updateDraftButton = false;
    this.selectedPostId = 0;
    this.buttonLoading = null;
    this.draftedPost = null;
  }

  redirectingToProfile() {
    this.router.navigate(['/profile-view']);
    this.clearForm();
  }

  //udpate drafted post and publish it function
  updatePost(type: 'publish' | 'draft') {
    if (!this.draftedPost || !this.draftedPost.postId) {
      this.snackBar.showError('No draft selected.');
      return;
    }

    const formData = new FormData();
    formData.append('PostId', this.draftedPost.postId.toString());
    formData.append('Title', this.postForm.value.title);
    formData.append('Description', this.postForm.value.description);
    if (type === 'draft') {
      formData.append('IsPublished', 'false');
      this.buttonLoading = 'draft';
    } else {
      formData.append('IsPublished', 'true');
      this.buttonLoading = 'publish';
    }

    formData.append('CategoryId', this.postForm.value.category.toString());

    const imageFile = this.postForm.get('image')?.value;
    if (imageFile) {
      formData.append('PostImage', imageFile);
    }

    this.masterService.updatePost(this.draftedPost.userId, formData).subscribe(
      (next) => {
        if (type === 'draft') {
          this.snackBar.showSuccess('Draft post updated successfully');
          this.getDraftedPost();
        } else {
          this.snackBar.showSuccess('Drafted Post published successfully');
          this.clearForm();
          this.redirectingToProfile();
        }
        this.buttonLoading = null;
      },
      (error) => {
        console.log(error);
        this.snackBar.showError(error?.error?.message || 'Error updating post.');
        this.buttonLoading = null;
      }
    );
  }


}
