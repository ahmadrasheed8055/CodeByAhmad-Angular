import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LoginComponent } from '../login/login.component';
import { MasterService } from '../../../Shared/master.service';
import { SnackBarServiceService } from '../../../Shared/snack-bar-service.service';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-forget-password',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css',
})
export class ForgetPasswordComponent {
  forgotPasswordForm: FormGroup;

  email: string = '';
  loading: boolean = false;
  emailSentingFormButton: string = 'Send Reset Link';
  errorMessage: string | null = null;
  successMessage: string | null = null;
  // emailSentingFormButton: string = 'Send Email';
  countDown: number = 0;
  emailPattern: string = '^[a-zA-Z0-9._%+-]+@gmail.com$';

  masterService = inject(MasterService);
  messages = inject(SnackBarServiceService);
  constructor() {
    this.forgotPasswordForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
      ]),
    });
  }

  sendFPEmail() {


    this.loading = true;
    this.emailSentingFormButton = 'Sending...';
    this.errorMessage = null;
    this.successMessage = null;

    const regex = new RegExp(this.emailPattern);


    

    if (this.forgotPasswordForm.valid) {
      // console.log(this.forgotPasswordForm.value); // { email: "..." }
      const email = this.forgotPasswordForm.value.email;
      // Call the service to send the forgot password email
      this.masterService.sendForgotPasswordEmail(email).subscribe({
        next: (response) => {
          this.messages.showSuccess(
            'Password reset email sent successfully. Please check your inbox.'
          );
          this.forgotPasswordForm.reset();
        },
        error: (error) => {
          // Error handling based on status code or message
          if (error.status === 400) {
            this.messages.showError('Email format is not correct.');
          } else if (error.status === 404) {
            this.messages.showError('User not found.');
          } else {
            this.messages.showError('Something went wrong. Please try again.');
          }
        },
      });
    }
  }
}
