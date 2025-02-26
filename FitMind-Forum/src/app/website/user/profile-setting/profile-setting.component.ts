import { Component, inject, OnInit } from '@angular/core';
import { AppUser } from '../../../Model/AppUsers';
import { AuthService } from '../../../Shared/auth.service';
import { MasterService } from '../../../Shared/master.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-setting',
  imports: [CommonModule],
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
  imageSuccessMessage:string = '';

  constructor() {
    this.user = new AppUser();
  }

  ngOnInit() {
    const userData = this.authServices.getUser();
    if (userData) {
      this.user =  userData;
      this.user.ProfilePhoto =  sessionStorage.getItem('profilePhoto') || '';
      
      this.joinDate = this.user.joinedDate.toString().split('T')[0];
    }
  }

  
  onUpload(event: any) {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
  
    if (!file) {
      this.imageErrorMessage = 'Please select an image';
      return;
    }
  
    this.masterServices.uploadProfilePicture(formData, this.user.id).subscribe(
      (next) => {
        this.imageSuccessMessage = 'Image uploaded successfully';
        this.user = this.authServices.getUser();
      
      },
      (error) => {
        this.imageErrorMessage = 'An error occurred while uploading the image';
        console.log(error);
      }
    );
  }
  
  
}
