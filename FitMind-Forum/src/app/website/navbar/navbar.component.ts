import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../Shared/auth.service';
import { AppUser } from '../../Model/AppUsers';
import { EmailVarificationComponent } from "../auth/emailVarification/emailVarification.component";
import { LoginComponent } from "../auth/login/login.component";

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule, EmailVarificationComponent, LoginComponent],

  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  loginModal: string = '#loginModal';
  registerModal: string = '#registerModal';
  emailVarificationModal: string = '#emailVarificationModal';
  user: AppUser;
  authServices = inject(AuthService);
  router = inject(Router);

  test() {
    debugger;
  }

  ngOnInit() {
    this.decruptUser();
  }
  constructor() {
    this.user = new AppUser();
  }


  decruptUser() {
    const dUser = sessionStorage.getItem('appUser');
    if (dUser) {
      this.user = this.authServices.decryptUser(dUser);
      // console.log(this.user);
    }
  }

  logout() {
    sessionStorage.removeItem('appUser');
    this.router.navigate(['/']).then(()=>{
      window.location.reload();
    });
  }
}
