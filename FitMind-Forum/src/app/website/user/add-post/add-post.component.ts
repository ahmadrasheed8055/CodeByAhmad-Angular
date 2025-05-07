import { Component, inject, NgModule } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MasterService } from '../../../Shared/master.service';
import { ICategories } from '../../../Model/categories';
import { SnackBarServiceService } from '../../../Shared/snack-bar-service.service';
import { CommonModule } from '@angular/common';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-post',
  imports: [ReactiveFormsModule, NgSelectModule, CommonModule],
  templateUrl: './add-post.component.html',
  styleUrl: './add-post.component.css'
})
export class AddPostComponent {
  postForm: FormGroup;
 masterService = inject(MasterService);
 categoriesObj:ICategories[] = [];
  
 snackBar = inject(SnackBarServiceService);
    constructor(private fb: FormBuilder) {
    this.postForm = new FormGroup({
      title:new FormControl(''),
      description: new FormControl(''), 
      category:new FormControl(''),
      image: new FormControl(''),
    });
  }

  ngOnInit(){
    this.getAllCategories();
  }
  onSubmit() {
    if (this.postForm.valid) {
      console.log(this.postForm.value);
    }
  }

  getAllCategories(){
    this.masterService.getAllCategories().subscribe(
      (next:any) =>{
        this.categoriesObj = next;
        console.log(this.categoriesObj);
      },
      (error) =>{
        this.snackBar.showError(error.message);
      }
    );
  }
  previewUrl: string | ArrayBuffer | null = null;
  openFileInput(event:any){
    const file = event.target as HTMLInputElement;
    if (file.files && file.files.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file.files[0]);
    }
  }
}
