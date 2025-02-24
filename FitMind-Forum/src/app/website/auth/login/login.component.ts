import { Component, OnInit, NgModule, inject } from '@angular/core';
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
  serviecs = inject(MasterService);
  authServices = inject(AuthService);
  route = inject(Router);
  errorMessage: string = '';

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
  closeModal(){
    const closeBtn = document.querySelector('.btn-close') as HTMLElement;
    if (closeBtn) {
      closeBtn.click();
      this.formData.reset();
      this.errorMessage = '';
    }
  }


  login() {
    // debugger;
    if (this.formData.valid) {
      const formValues = this.formData.value;
      this.user = {
        Email: formValues.email,
        HashedPassword: formValues.password,
      };

      this.serviecs.loginUser(this.user).subscribe(
        (next) => {
          const encrypUser = this.authServices.encryptUser(next);
          sessionStorage.setItem('appUser', encrypUser);
          //closing modal
          this.closeModal();

          this.route.navigate(['/home']);
          console.log('User added: ' + next);
        },
        (error) => {
          if (error.status === 404) {
            this.errorMessage = 'User not found';
          } else if (error.status === 400) {
            this.errorMessage = 'Invalid password';
          } else {
            this.errorMessage = 'An error occurred while logging in';
          }
          console.log('Error to login:' + error);
        }
      );
    }
  }
}
