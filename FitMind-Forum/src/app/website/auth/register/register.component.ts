import { Component, inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  user: IAppUser;

  appForm!: FormGroup;

  ngOnInit() {
    this.user.email = localStorage.getItem('userEmail') || '';

    this.appForm = new FormGroup({
      userName: new FormControl(this.user.username, [Validators.required, Validators.minLength(3)]),
      email: new FormControl(this.user.email),
      password: new FormControl(this.user.passwordHash, [
        Validators.required,
        Validators.minLength(6),  // Minimum length of 6 characters
        Validators.pattern('^(?=.*[A-Z])(?=.*\\d).+$') // At least one uppercase letter & one number
      ])
    });

    this.route.queryParams.subscribe((p) => {
      this.message = p['message'];
    });
  }

  services = inject(MasterService);
  message: string = '';
  loginModal: string = '#loginModal';
  //user object
}
