import { Component, inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MasterService } from '../../../Shared/master.service';
import { AppUser, IAppUser } from '../../../Model/AppUsers';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  RequiredValidator,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { response } from 'express';
import { AuthService } from '../../../Shared/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  //user object
  constructor(private route: ActivatedRoute) {
    this.user = new AppUser();
  }
  user: AppUser;

  appForm!: FormGroup;

  ngOnInit() {
    this.user.email = localStorage.getItem('userEmail') || '';

    this.appForm = new FormGroup({
      userName: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      email: new FormControl(this.user.email),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6), // Minimum length of 6 characters
        Validators.pattern('^(?=.*[A-Z])(?=.*\\d).+$'), // At least one uppercase letter & one number
      ]),
    });

    this.route.queryParams.subscribe((p) => {
      this.message = p['message'];
    });
  }

  services = inject(MasterService);
  authServices = inject(AuthService);
  message: string = '';
  loginModal: string = '#loginModal';
  router = inject(Router);
  //user object

  addUser() {
    const formData = this.appForm.value;
    const userEmail = localStorage.getItem('userEmail');
    const newUser: AppUser = {
      id: 0,
      username: formData.userName,
      email: userEmail || '',
      passwordHash: formData.password,
      emailConfirmed: true,
      isDeleted: false,
      joinedDate: new Date(),
      updatedAt: new Date(),
      status: 2,
      uniqueName: '',
      userVisibility: 0,
      bio: '',
      phone: 0,
      facebookLink: '',
      instagramLink: '',
      location: '',
      country:'',
      profilePhoto: '',
      backgroundPhoto:''
    };
    
    this.services.addAppUser(newUser).subscribe(
      (next: any) => {
        const encryptedUser = this.authServices.encryptUser(newUser);
        sessionStorage.setItem('appUser', encryptedUser);
        console.log('User Added!');
        this.router.navigateByUrl('/home');
      },
      (error: any) => {
        console.log(error + 'Error adding this user');
      }
    );
  }

  logout(){
    sessionStorage.removeItem('appUser');
  }

 

}
