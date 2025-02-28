import { Component, inject, OnInit } from '@angular/core';
import { AppUser } from '../../../Model/AppUsers';
import { AuthService } from '../../../Shared/auth.service';
import { MasterService } from '../../../Shared/master.service';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile-setting',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-setting.component.html',
  styleUrl: './profile-setting.component.css',
})
export class ProfileSettingComponent implements OnInit {
  //user data
  authServices = inject(AuthService);
  masterServices = inject(MasterService);
  joinDate: string = '';
  user!: AppUser;
  imageErrorMessage: string = '';
  imageSuccessMessage: string = '';
  formGroup!:FormGroup;

  constructor() {
    this.user = new AppUser();
  }

  ngOnInit() {

    this.formGroup = new FormGroup({
      // fullName phone userName visibility  bio country facebookLink instagramLink
      fullName: new FormControl(this.authServices.user.username, [Validators.required]),
     phone: new FormControl('', [Validators.required]),
     userName: new FormControl(this.authServices.user.UniqueName, [Validators.required]),
     visibility: new FormControl(this.authServices.user.UserVisibility, [Validators.required]),
     bio: new FormControl('', [Validators.required]),
     location:new FormControl('', [Validators.required]),
     country: new FormControl('', [Validators.required]),
     facebookLink: new FormControl(''),
     instagramLink: new FormControl(''),
    });
  }

  getErrorMessage(field:string, name:string):string{
    if(this.formGroup.controls[field].hasError('required')){
      return name + ' is required';
    }
    return '';
  }

  onUpload(event: any) {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    if (!file) {
      this.imageErrorMessage = '';
      this.imageErrorMessage = 'Please select an image';
      return;
    }
    debugger;
    this.masterServices.uploadProfilePicture(formData, this.authServices.user.id).subscribe(
      (next) => {
        debugger;
        this.imageSuccessMessage = 'Image uploaded successfully';
        this.authServices.updateProfilePhoto();
      },
      (error) => {
        this.imageErrorMessage = 'An error occurred while uploading the image';
        console.log(error);
      }
    );
  }

  updateBackgroundImage(event: any) {
    //step 1 choose the file
    const file = event.target.files[0];
    //step 2 
    const formData = new FormData();
    formData.append('file', file);
    if(!file){
      this.imageErrorMessage = 'Please select an image';
      return;
    }

    this.masterServices.uploadBackgroundPicture(formData, this.authServices.user.id).subscribe(
      (next)=>{
        this.authServices.updateBackgroundPhoto();
        this.imageSuccessMessage = 'Image uploaded successfully';
        
        // console.log(next);
        return;
      },
      error=>{
        this.imageErrorMessage = 'An error occurred while uploading the image';
        // console.log(error);
        return;
      }
    );
  }

  //update user
  updateUser(){
    debugger;
    const userData = this.formGroup.value;
    console.log(userData);
  }
}
