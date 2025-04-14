import { Component, ElementRef, inject, OnInit, ViewChild, viewChild } from '@angular/core';
import {
  AppUser,
  AppUserPhotos,
  PublicAppUserDTO,
  UpdateAppUserDTO,
} from '../../../Model/AppUsers';
import { AuthService } from '../../../Shared/auth.service';
import { MasterService } from '../../../Shared/master.service';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormControl,
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { error } from 'jquery';
import { SnackBarServiceService } from '../../../Shared/snack-bar-service.service';
import { debounceTime, distinctUntilChanged, filter, skip, switchMap } from 'rxjs';
import bootstrap from '../../../../main.server';


@Component({
  selector: 'app-profile-setting',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './profile-setting.component.html',
  styleUrl: './profile-setting.component.css',
})
export class ProfileSettingComponent implements OnInit {
  private snackbar = inject(SnackBarServiceService);

  //user data
  authServices = inject(AuthService);
  masterServices = inject(MasterService);
  joinDate: string = '';
  user!: PublicAppUserDTO;
  userPhotos!: AppUserPhotos;
  imageErrorMessage: string = '';
  imageSuccessMessage: string = '';
  bgImageSuccessMessage: string = '';
  bgImageErrorMessage: string = '';
  formGroup!: FormGroup;
  isTaken: any = false;
  isCheckingUniqueName: boolean = false;
  deleteProfileModal = '#deleteProfileModal';

  constructor() {this.user = new AppUser();}
  showSuccess(message: string) { this.snackbar.showSuccess(message);}

  showError(error: string) {this.snackbar.showError(error);}
  

 
  ngOnInit() {
    // Initialize form with empty values
    this.formGroup = new FormGroup({
      id: new FormControl(null),
      username: new FormControl(null, [Validators.required]),
      phone: new FormControl(null, [Validators.required]),
      uniqueName: new FormControl(null, [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern('^[a-zA-Z0-9_]+$') //->only letters, numbers, and underscores
      ]),
      bio: new FormControl(null, [Validators.required]),
      location: new FormControl(null, [Validators.required]),
      country: new FormControl(null, [Validators.required]),
      facebookLink: new FormControl(null),
      instagramLink: new FormControl(null),
    });

    this.formGroup.controls['uniqueName'].valueChanges.pipe(
      skip(1),// skip the first load
      filter((value): value is string => value !== null && value !== undefined),
      debounceTime(1000),
      distinctUntilChanged(),
      switchMap((value) => this.masterServices.checkUniqueName(value))
    ).subscribe((isTaken) => {
      this.isTaken = isTaken;
      this.isCheckingUniqueName = true;
      console.log(isTaken);
    });

    // Subscribe to user data and update form
    this.authServices.appUserData$.subscribe((user) => {
      debugger;
      if (user) {
        this.user = { ...user }; // Store user data
        this.formGroup.patchValue(this.user);
      }
    });

    this.authServices.appUserPhotos$.subscribe((photos) => {
      if (!photos) {
        return;
      }

      this.userPhotos = photos;
    });
  }

  onUpload(event: any) {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    if (!file) {
      this.imageErrorMessage = '';
      this.imageErrorMessage = 'Please select an image';
      return;
    }
    debugger;
    this.masterServices.uploadProfilePicture(formData, this.user.id).subscribe(
      (next) => {
        debugger;
        this.imageSuccessMessage = 'Image uploaded successfully';
        this.showSuccess(this.imageSuccessMessage);

        this.authServices.updateProfilePhoto(this.user.id);
      },
      (error) => {
        this.imageErrorMessage = 'An error occurred while uploading the image';
        console.log(error);
      }
    );
  }

  updateBackgroundImage(event: any) {
    //step 1 choose the file
    const file = event.target.files[0];
    //step 2
    const formData = new FormData();
    formData.append('file', file);
    if (!file) {this.imageErrorMessage = 'Please select an image';return; }

    this.masterServices
      .uploadBackgroundPicture(formData, this.user.id)
      .subscribe(
        (next) => {
          this.authServices.updateBackgroundPhoto(this.user.id);
          this.bgImageSuccessMessage = 'Image uploaded successfully';
          this.showSuccess(this.bgImageSuccessMessage);
          return;
        },
        (error) => {
          this.bgImageErrorMessage ='An error occurred while uploading the image';
          this.showSuccess(this.bgImageErrorMessage);
          return;
        }
      );
  }

  //update user
  updateUser() {
    if(this.isTaken){ this.showError('Username is already taken'); return; }

    const updateAppUserData: UpdateAppUserDTO = {
      id: this.user.id,username: this.formGroup.value.username,
      uniqueName: this.formGroup.value.uniqueName , //string | null issue
      // userVisibility: this.formGroup.value.visibility,
      bio: this.formGroup.value.bio,phone: this.formGroup.value.phone,
      facebookLink: this.formGroup.value.facebookLink,
      instagramLink: this.formGroup.value.instagramLink,
      location: this.formGroup.value.location,
      country: this.formGroup.value.country,
    };

    this.user = { ...this.user, ...updateAppUserData };

    this.masterServices.updateAppUser(this.user.id, this.user).subscribe(
      (next) => {
        this.authServices.updateUserData(this.user);
        this.showSuccess('User updated successfully');
      },(error) => {
        if (error.status === 400) {
          this.showError('Bad request: ' + error.error.message);
        } else if (error.status === 409) {
          this.showError('Unique name already exists.');
        } else if (error.status === 500) {
          this.showError('Server error. Please try again later.');
        } else {
          this.showError('An unexpected error occurred!');
        }
      }
    );
  }

  @ViewChild('closeModal') closeModalButton!:ElementRef<HTMLButtonElement>;
  closeModal() {
    debugger;
    const closeBtn = document.querySelector('.btn-close') as HTMLElement;
    if (closeBtn) {
      closeBtn.click();
    }
    this.closeModalButton.nativeElement.click();
  }
  

  onDeleteConfirmed(type: string) {
    if (type === 'profileConfirmation') {
      if (this.userPhotos.profilePhoto) {
        this.masterServices.deleteProfilePicture(this.user.id).subscribe({
          next: (res) => {
            this.userPhotos.profilePhoto = '';
            this.closeModalButton.nativeElement.click();
            this.showSuccess('Profile photo deleted!');
          },
          error: (err) => {
            this.showError('Error: ' + err);
          }
        });
        this.closeModal();
      }  
    } else if (type === 'backgroundConfirmation') {
      if (this.userPhotos.backgroundPhoto) {
        this.masterServices.deleteBackgroundPicture(this.user.id).subscribe({
          next: (res) => {
            this.userPhotos.backgroundPhoto = '';
            this.closeModalButton.nativeElement.click();
            this.showSuccess('Background photo deleted!');
          },
          error: (err) => {
            this.showError('Error: ' + err);
          }
        });

    
            // this.userPhotos.backgroundPhoto = '';

      }
  
    } else {
      this.showError('Error while deleting this image');
    }
  }
  

  
}
