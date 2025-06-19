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
  draftedPost: GetDraftedPostDTO[] | null = null;
  IsdraftedPostAvailable: boolean = false;
  updateDraftButton: boolean = false;
  selectedPostId: number | null = null;

  constructor(private fb: FormBuilder) {
    this.postForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
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
      console.log(file.files[0]);
      this.postForm.patchValue({
        image: file.files[0],
      });
    }
  }

  removeImage() {
    this.previewUrl = null;
  }

  //add post
  onSubmit(type: 'publish' | 'draft') {
    // debugger;
    this.buttonLoading = type;

    if (this.postForm.valid) {
      debugger;
      const formData = new FormData();
      const userId = sessionStorage.getItem('appUserId');

      formData.append('Title', this.postForm.value.title);
      formData.append('Description', this.postForm.value.description);
      formData.append('UpdatedAt', new Date().toISOString());
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
          // this.snackBar.showSuccess('Post added successfully');
          if (type === 'draft') {
            this.snackBar.showSuccess('Post saved as draft');
            this.IsdraftedPostAvailable = true;
            this.getDraftedPost();
          } else {
            this.snackBar.showSuccess('Post published successfully');
          }
          this.buttonLoading = null;
          this.updateDraftButton = true;
          // this.previewUrl = null;
          // this.postForm.reset();
        },
        (error) => {
          if (error.status === 400) {
            this.snackBar.showError(error.error);
          } else if (error.status === 404) {
            this.snackBar.showError('Categorie not found'); //
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
        this.draftedPost = next;
      },
      (error) => {
        if (error.status === 404) {
          // this.snackBar.showError('No drafted post found for this user');
        } else {
          // this.snackBar.showError('An error occurred while fetching drafted post');
        }
        this.draftedPost = null;
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
    this.masterService.deleteDraftedPost(postId).subscribe(
      (next) => {
        this.snackBar.showSuccess('Drafted post deleted successfully');
        this.getDraftedPost();
        this.selectedPostId = null;
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
   @ViewChild('closeDraftModalButton') closeDraftModalButton!: ElementRef<HTMLButtonElement>;

  updateDraftPostButton(postId: number) {
   
    let obj = this.draftedPost?.find((x) => x.postId == postId);
    if (obj) {
      this.postForm.patchValue({
        title: obj.title,
        description: obj.description,
        category: obj.categoryId,
      });
    }
    this.updateDraftButton = true;
   this.closeDraftModalButton.nativeElement.click();

  }

clearForm(){
  this.postForm.reset();
  this.previewUrl = null;
  this.updateDraftButton = false;
  this.selectedPostId = null;
  this.buttonLoading = null;
  // this.draftedPost = null;
  // this.IsdraftedPostAvailable = false;
}

}
