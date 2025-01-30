import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './registration.component.html',
  styles: ``
})
export class RegistrationComponent {
  form: FormGroup;
  constructor(public formBuilder: FormBuilder) {

    this.form = this.formBuilder.group({
      fullName: [''],
      email: [''],
      password: [''],
      confirmPassword: ['']
    });
  }


  onsubmit(){
    console.log(this.form.value);
  }


}
