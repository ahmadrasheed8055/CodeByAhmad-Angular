import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../Shared/auth.service';
import { AppUser, AppUserPhotos, PublicAppUserDTO } from '../../Model/AppUsers';
import { EmailVarificationComponent } from '../auth/emailVarification/emailVarification.component';
import { LoginComponent } from '../auth/login/login.component';
import { MasterService } from '../../Shared/master.service';
import { SnackBarServiceService } from '../../Shared/snack-bar-service.service';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    RouterModule,
    EmailVarificationComponent,
    LoginComponent,
  ],

  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  loginModal: string = '#loginModal';
  deleteProfileModal = '#deleteProfileModal';
  registerModal: string = '#registerModal';
  emailVarificationModal: string = '#emailVarificationModal';
  user!: PublicAppUserDTO;
  userPhotos!: AppUserPhotos;
  authServices = inject(AuthService);
  router = inject(Router);
  masterServices = inject(MasterService);
  snackBarService = inject(SnackBarServiceService);
  ngOnInit() {
    // //debugger;

    this.authServices.appUserData$.subscribe((user) => {
      //debugger;
      if (user) {
        // Ensure user is not null/undefined
        this.user = { ...user }; // Create a new object to avoid unintended mutations
      }
    });
    this.authServices.appUserPhotos$.subscribe((photos) => {
      //debugger;
      if (!photos) return;
      this.userPhotos = photos;
    });
    // console.log(this.user);
  }

  constructor() {
    this.user = new AppUser();
  }

  logout() {
    sessionStorage.removeItem('appUserId');
    sessionStorage.clear();
    this.snackBarService.showSuccess('Logout successfully!');
    this.router.navigate(['/']);
  }
}

// decruptUser() {
//   const dUser = sessionStorage.getItem('appUser');
//   if (dUser) {
//     this.user = this.authServices.decryptUser(dUser);
//   //  console.log(this.getProfile());

//   }
// }
