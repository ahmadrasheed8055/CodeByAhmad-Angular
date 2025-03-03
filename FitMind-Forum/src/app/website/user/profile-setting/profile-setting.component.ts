import { Component, inject, OnInit } from '@angular/core';
import { AppUser, UpdateAppUserDTO } from '../../../Model/AppUsers';
import { AuthService } from '../../../Shared/auth.service';
import { MasterService } from '../../../Shared/master.service';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { error } from 'jquery';

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
  formGroup!: FormGroup;

  constructor() {
    this.user = new AppUser();
  }

  ngOnInit() {
    this.formGroup = new FormGroup({
      id: new FormControl(this.authServices.user.id),
      // fullName phone userName visibility  bio country facebookLink instagramLink
      fullName: new FormControl(this.authServices.user.username, [
        Validators.required,
      ]),
      phone: new FormControl(this.authServices.user.phone, [Validators.required]),
      userName: new FormControl(this.authServices.user.uniqueName, [
        Validators.required,
      ]),
      visibility: new FormControl(this.authServices.user.userVisibility, [
        Validators.required,
      ]),
      bio: new FormControl(this.authServices.user.bio, [Validators.required]),
      location: new FormControl(this.authServices.user.location, [Validators.required]),
      country: new FormControl(this.authServices.user.country, [Validators.required]),
      facebookLink: new FormControl(this.authServices.user.facebookLink),
      instagramLink: new FormControl(this.authServices.user.instagramLink),
    });
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
    this.masterServices
      .uploadProfilePicture(formData, this.authServices.user.id)
      .subscribe(
        (next) => {
          debugger;
          this.imageSuccessMessage = 'Image uploaded successfully';
          this.authServices.updateProfilePhoto();
        },
        (error) => {
          this.imageErrorMessage =
            'An error occurred while uploading the image';
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
      .uploadBackgroundPicture(formData, this.authServices.user.id)
      .subscribe(
        (next) => {
          this.authServices.updateBackgroundPhoto();
          this.imageSuccessMessage = 'Image uploaded successfully';

          // console.log(next);
          return;
        },
        (error) => {
          this.imageErrorMessage =
            'An error occurred while uploading the image';
          // console.log(error);
          return;
        }
      );
  }
 
  //update user
  updateUser() {
    debugger;
    const updateAppUserData: UpdateAppUserDTO = {
      Id: this.authServices.user.id,
      Username: this.formGroup.value.fullName,
      UniqueName: this.formGroup.value.userName,
      UserVisibility: this.formGroup.value.visibility,
      Bio: this.formGroup.value.bio,
      Phone: this.formGroup.value.phone,
      FacebookLink: this.formGroup.value.facebookLink,
      InstagramLink: this.formGroup.value.instagramLink,
      Location: this.formGroup.value.location,
      Country: this.formGroup.value.country,
    };
    this.authServices.user = {...this.authServices.user, ...updateAppUserData}

    this.masterServices
      .updateAppUser(this.authServices.user.id, updateAppUserData)
      .subscribe(
        (next) => {
          debugger;
          // this.authServices.getUser();
          
          sessionStorage.setItem('appUser', this.authServices.encryptUser(this.authServices.user));
          console.log(next);
        },
        (error) => {
          console.log(error);
        }
      );
  }
}
