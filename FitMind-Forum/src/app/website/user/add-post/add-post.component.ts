import { Component, inject, NgModule } from '@angular/core';
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


  constructor(private fb: FormBuilder) {
    this.postForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      category: new FormControl('', [Validators.required]),
      image: new FormControl(''),
    });
  }

  ngOnInit() {
    this.getAllCategories();
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

  
  onSubmit(type: string) {
    if (this.postForm.valid) {
      debugger;
      const formData = new FormData();
      const userId = sessionStorage.getItem('appUserId');

      formData.append('Title', this.postForm.value.title);
      formData.append('Description', this.postForm.value.description);
      formData.append('UpdatedAt', new Date().toISOString());
      if (type === 'draft') {
        formData.append('IsPublished', 'false');
      }
      else if (type === 'publish') {
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
          this.snackBar.showSuccess('Post added successfully');
          this.previewUrl = null; 
          this.postForm.reset();
        },
        (error) => {
          this.snackBar.showError(error.message);
        }
      );
    }
  }
  

}
