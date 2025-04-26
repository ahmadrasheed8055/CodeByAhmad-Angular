import { Component, inject, NgModule } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
    this.postForm = this.fb.group({
      title: [''],
      category: [''],
      description: ['']
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
}
