import {
  Component,
  OnInit,
  NgModule,
  inject,
  viewChild,
  ElementRef,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserLoginDTO } from '../../../Model/AppUsers';
import { CommonModule } from '@angular/common';
import { MasterService } from '../../../Shared/master.service';
import { AuthService } from '../../../Shared/auth.service';
import { Router } from '@angular/router';
import { NgxLoaderService } from '../../../Shared/ngx-loader.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],

  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  user: UserLoginDTO = {
    Email: '',
    HashedPassword: '',
  };

  formData!: FormGroup;
  registerModal: string = '#registerModal';
  emailVarificationModal: string = '#emailVarificationModal';
  services = inject(MasterService);
  authServices = inject(AuthService);
  route = inject(Router);
  errorMessage: string = '';
  loginBtn: string = 'Login';
  loginBtnLoading: boolean = false;
  @ViewChild('closeLoginModal', { static: false }) closeButton!: ElementRef;
  ngxLoader = inject(NgxLoaderService);

  ngAfterViewInit() {
    // console.log('Modal close button initialized:', this.closeButton);
  }

  constructor() {
    // this.user = new UserLoginDTO();
  }

  ngOnInit() {
    this.formData = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/),
      ]),
      password: new FormControl('', [Validators.required]),
    });
  }

  // viewModal:boolean=false;
  closeModal() {
    const closeBtn = document.querySelector('.btn-close') as HTMLElement;
    if (closeBtn) {
      closeBtn.click();
      this.formData.reset();
      this.errorMessage = '';
      this.loginBtnLoading = false;
    }
  }

  afterLogin() {
    if (sessionStorage.getItem('appUserId')) {
      this.authServices.setAppUser();
    }
  }

  login() {
    if (this.formData.valid) {
      this.loginBtn = 'Loading...';
      this.loginBtnLoading = true;
      const formValues = this.formData.value;
      this.user = {
        Email: formValues.email,
        HashedPassword: formValues.password,
      };

      // debugger;
      this.services.loginUser(this.user).subscribe({
        next: (result) => {

          sessionStorage.setItem('token', result.token);
          sessionStorage.setItem('appUserId', result.userId.toString());
          // console.log("Token: " + result.token);
          this.ngxLoader.startLoading();
      
          this.route.navigate(['/home']).then(() => {
            this.loginBtn = 'Login';
            this.loginBtnLoading = false;
            this.closeButton.nativeElement.click();
            this.afterLogin();
            this.closeModal();
          });
        },
        error: (error) => {
          this.loginBtn = 'Login';
          this.loginBtnLoading = false;
      
          if (error.status === 404) {
            this.errorMessage = 'User not found';
          } else if (error.status === 400) {
            this.errorMessage = 'Invalid password';
          } else {
            this.errorMessage = 'An error occurred while logging in';
          }
      
          console.log('Error during login:', error);
        }
      });
      
    }
  }
}
