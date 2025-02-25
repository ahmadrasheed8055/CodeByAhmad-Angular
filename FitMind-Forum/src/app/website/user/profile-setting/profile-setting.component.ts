import { Component, inject, OnInit } from '@angular/core';
import { AppUser } from '../../../Model/AppUsers';
import { AuthService } from '../../../Shared/auth.service';

@Component({
  selector: 'app-profile-setting',
  imports: [],
  templateUrl: './profile-setting.component.html',
  styleUrl: './profile-setting.component.css',
})
export class ProfileSettingComponent implements OnInit {
  //user data
  user: AppUser;
  authServices = inject(AuthService);
  joinDate: string = '';
  constructor() {
    this.user = new AppUser();
  }

  ngOnInit() {
    this.decryptUser();
  }

  imageErrorMessage: string = '';

  onUpload(event: any) {
   
    
  }

  decryptUser() {
    const dUser = sessionStorage.getItem('appUser');
    if (dUser) {
      this.user = this.authServices.decryptUser(dUser);
      const joinigDate = new Date(this.user.joinedDate);
      this.joinDate = joinigDate.toDateString();
      // console.log(this.user);
    }
  }
}
