import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../Shared/auth.service';
import { AppUser } from '../../Model/AppUsers';
import { EmailVarificationComponent } from "../auth/emailVarification/emailVarification.component";
import { LoginComponent } from "../auth/login/login.component";
import { MasterService } from '../../Shared/master.service';

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
  user!: AppUser;
  authServices = inject(AuthService);
  router = inject(Router);
  masterServices = inject(MasterService);


  ngOnInit() {
    // debugger;
    
    // this.getProfile();
   this.user =  this.authServices.getUser();
    console.log(this.user);
    
  }
  
  constructor() {
    
    
    // this.user = new AppUser();
  }


  logout() {
    sessionStorage.removeItem('appUser');
    this.router.navigate(['/']).then(()=>{
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