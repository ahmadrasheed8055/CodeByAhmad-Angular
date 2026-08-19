import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  AbstractControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MasterService } from '../../../Shared/master.service';
import { SnackBarServiceService } from '../../../Shared/snack-bar-service.service';
import { AuthService } from '../../../Shared/auth.service';
import { FormSkeletonComponent } from '../../../Shared/skeleton';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, FormSkeletonComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  token: string | null = null;
  isValidToken: boolean = false;
  loading: boolean = true;
  submitting: boolean = false;
  hideNewPassword: boolean = true;
  hideConfirmPassword: boolean = true;
  userEmail: string | null = null;

  route = inject(ActivatedRoute);
  router = inject(Router);
  masterService = inject(MasterService);
  messages = inject(SnackBarServiceService);
  authServices = inject(AuthService);

  constructor() {
    this.resetPasswordForm = new FormGroup({
      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
    }, this.passwordMatchValidator);
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    
    if (this.token) {
      this.masterService.validateResetToken(this.token).subscribe({
        next: (res: any) => {
          this.isValidToken = true;
          this.loading = false;
          this.userEmail = res.email || null;
        },
        error: (err) => {
          this.isValidToken = false;
          this.loading = false;
          this.messages.showError(err.error?.message || 'Invalid or expired token.');
        }
      });
    } else {
      this.loading = false;
      this.isValidToken = false;
      this.messages.showError('Token is missing from the URL.');
    }
  }

  passwordMatchValidator(g: AbstractControl) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onSubmit() {
    if (this.resetPasswordForm.valid && this.token) {
      this.submitting = true;
      const payload = {
        token: this.token,
        newPassword: this.resetPasswordForm.value.newPassword
      };

      this.masterService.resetPassword(payload).subscribe({
        next: (res: any) => {
          this.messages.showSuccess(res.message || 'Password reset successful!');
          
          if (this.userEmail) {
            this.masterService.loginUser({ Email: this.userEmail, HashedPassword: payload.newPassword }).subscribe({
              next: (loginResult: any) => {
                sessionStorage.setItem('token', loginResult.token);
                sessionStorage.setItem('appUserId', loginResult.userId.toString());
                this.router.navigate(['/home']).then(() => {
                  if (sessionStorage.getItem('appUserId')) {
                    this.authServices.setAppUser();
                    this.authServices.setAppUserId(Number(sessionStorage.getItem('appUserId')));
                    this.authServices.getAllPosts();
                  }
                });
              },
              error: () => this.router.navigate(['/login'])
            });
          } else {
            this.router.navigate(['/login']);
          }
        },
        error: (err) => {
          this.submitting = false;
          this.messages.showError(err.error?.message || 'Error resetting password. Please try again.');
        }
      });
    } else {
      this.resetPasswordForm.markAllAsTouched();
    }
  }
}
