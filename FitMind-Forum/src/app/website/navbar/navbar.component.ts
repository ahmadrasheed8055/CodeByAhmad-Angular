import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../Shared/auth.service';
import { AppUser, PublicAppUserDTO } from '../../Model/AppUsers';
import { EmailVarificationComponent } from '../auth/emailVarification/emailVarification.component';
import { LoginComponent } from '../auth/login/login.component';
import { MasterService } from '../../Shared/master.service';

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
  registerModal: string = '#registerModal';
  emailVarificationModal: string = '#emailVarificationModal';
  user!: PublicAppUserDTO;
  authServices = inject(AuthService);
  router = inject(Router);
  masterServices = inject(MasterService);

  ngOnInit() {
    const userId = sessionStorage.getItem('appUserId');
    this.authServices.setUser(Number(userId));
    // debugger;


    this.authServices.appUserData$.subscribe((newUser) => {
      debugger;
      if (newUser) {  // Ensure user is not null/undefined
        this.user = newUser; // Create a new object to avoid unintended mutations
      }
    });
    
    // console.log(this.user);
  }

  constructor() {
    this.user = new AppUser();
  }

  logout() {
    sessionStorage.removeItem('appUserId');
    this.router.navigate(['/']).then(() => {
      window.location.reload();
    });
  }
}

// decruptUser() {
//   const dUser = sessionStorage.getItem('appUser');
//   if (dUser) {
//     this.user = this.authServices.decryptUser(dUser);
//   //  console.log(this.getProfile());

//   }
// }
