import { Component, inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MasterService } from '../../../Shared/master.service';
import { AppUser, IAppUser, RegisterUserDTO } from '../../../Model/AppUsers';
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
import { SnackBarServiceService } from '../../../Shared/snack-bar-service.service';

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
  snackMessageService = inject(SnackBarServiceService);
  //user object

  showSuccess(message: string) {
    this.snackMessageService.showSuccess(message);
  }

  showError(error: string) {
    this.snackMessageService.showError(error);
  }

  addUser() {
    const formData = this.appForm.value;
    const userEmail = localStorage.getItem('userEmail');
    const newUser: RegisterUserDTO = {
      Id: 0,
      Username: formData.userName,
      Email: userEmail || '',
      PasswordHash: formData.password,
    };
    
    this.services.addAppUser(newUser).subscribe(
      (next: any) => {
        debugger;
        // const encryptedUser = this.authServices.encryptUser(newUser.id);
        sessionStorage.setItem('appUserId', next.id);
        this.authServices.setAppUser();
        console.log('User Added!');
        this.showSuccess("You are successfully logged in!");
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
