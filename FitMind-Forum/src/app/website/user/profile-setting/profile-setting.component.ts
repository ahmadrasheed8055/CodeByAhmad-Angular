import { Component, inject, OnInit } from '@angular/core';
import {
  AppUser,
  AppUserPhotos,
  PublicAppUserDTO,
  UpdateAppUserDTO,
} from '../../../Model/AppUsers';
import { AuthService } from '../../../Shared/auth.service';
import { MasterService } from '../../../Shared/master.service';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormControl,
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { error } from 'jquery';
import { SnackBarServiceService } from '../../../Shared/snack-bar-service.service';

@Component({
  selector: 'app-profile-setting',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './profile-setting.component.html',
  styleUrl: './profile-setting.component.css',
})
export class ProfileSettingComponent implements OnInit {
  private snackbar = inject(SnackBarServiceService);

  //user data
  authServices = inject(AuthService);
  masterServices = inject(MasterService);
  joinDate: string = '';
  user!: PublicAppUserDTO;
  userPhotos!:AppUserPhotos;
  imageErrorMessage: string = '';
  imageSuccessMessage: string = '';
  bgImageSuccessMessage: string = '';
  bgImageErrorMessage: string = '';
  formGroup!: FormGroup;

  constructor() {
    this.user = new AppUser();
  }
  showSuccess(message: string) {
    this.snackbar.showSuccess(message);
  }

  showError(error: string) {
    this.snackbar.showError(error);
  }
  ngOnInit() {
     // Initialize form with empty values
  this.formGroup = new FormGroup({
    id: new FormControl(null),
    username: new FormControl(null, [Validators.required]),
    phone: new FormControl(null, [Validators.required]),
    uniqueName: new FormControl(null, [Validators.required]),
    // visibility: new FormControl(null, [Validators.required]),
    bio: new FormControl(null, [Validators.required]),
    location: new FormControl(null, [Validators.required]),
    country: new FormControl(null, [Validators.required]),
    facebookLink: new FormControl(null),
    instagramLink: new FormControl(null),
  });

  // Subscribe to user data and update form
  this.authServices.appUserData$.subscribe((user) => {
    debugger;
    if (user) {

      this.user = { ...user }; // Store user data
      this.formGroup.patchValue(this.user); 
    }
  });

  this.authServices.appUserPhotos$.subscribe((photos)=>{
    if (!photos) {
      return;
    }

    this.userPhotos = photos;
  })
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
    this.masterServices.uploadProfilePicture(formData, this.user.id).subscribe(
      (next) => {
        debugger;
        this.imageSuccessMessage = 'Image uploaded successfully';
        this.showSuccess(this.imageSuccessMessage);
        
      this.authServices.updateProfilePhoto(this.user.id);
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
    if (!file) {
      this.imageErrorMessage = 'Please select an image';
      return;
    }

    this.masterServices
      .uploadBackgroundPicture(formData, this.user.id)
      .subscribe(
        (next) => {
          this.authServices.updateBackgroundPhoto(this.user.id);
          this.bgImageSuccessMessage = 'Image uploaded successfully';
          this.showSuccess(this.bgImageSuccessMessage);
          // console.log(next);
          return;
        },
        (error) => {
          this.bgImageErrorMessage =
            'An error occurred while uploading the image';
          this.showSuccess(this.bgImageErrorMessage);

          // console.log(error);
          return;
        }
      );
  }

  //update user
  updateUser() {
    debugger;
    const updateAppUserData: UpdateAppUserDTO = {
      id: this.user.id,
      username: this.formGroup.value.username,
      uniqueName: this.formGroup.value.uniqueName,
      // userVisibility: this.formGroup.value.visibility,
      bio: this.formGroup.value.bio,
      phone: this.formGroup.value.phone,
      facebookLink: this.formGroup.value.facebookLink,
      instagramLink: this.formGroup.value.instagramLink,
      location: this.formGroup.value.location,
      country: this.formGroup.value.country,
    };
    this.user = { ...this.user, ...updateAppUserData };

    this.masterServices.updateAppUser(this.user.id, this.user).subscribe(
      (next) => {
        debugger;
        this.authServices.updateUserData(this.user);
        this.showSuccess('User updated successfully');
        console.log(next);
      },
      (error) => {
        this.showError('Error occur while updating user!');

        // console.log(error);
      }
    );
  }
}
